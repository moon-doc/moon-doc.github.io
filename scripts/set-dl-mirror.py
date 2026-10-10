#!/usr/bin/env python3
"""切换 / 校验 latest.json 与 version.json 里发布资产的下载前缀。

为什么需要它
------------
App 内自动更新的 *清单* 托管在 GitHub Pages（moon.jdk.plus → Fastly），中国大陆可达；
但清单里指向的 *资产* 在 GitHub Release（github.com → objects.githubusercontent.com），
大陆不可达：`curl` 拿到一段 JSON 错误体、或直接超时。结果是「检查更新能通过、
下载更新必然失败」，官网下载按钮同理。

修法只有一处旋钮：清单里的 URL。因为清单由我们自己托管，改一次 push 一分钟内生效，
**不需要重新发版**。本脚本把「去掉任意旧前缀 → 套上新前缀」做成幂等操作，并就地校验
每个 URL 的可达性与字节数（对照 GitHub Releases API 报告的大小，能抓住镜像的半截响应）。

用法
----
    # 换到某个镜像（会改写两个清单，然后校验）
    python3 scripts/set-dl-mirror.py --mirror https://ghfast.top/

    # 回到 GitHub 直链（大陆不可用，仅用于排障对照）
    python3 scripts/set-dl-mirror.py --mirror none

    # 只校验当前清单里的 URL，不改写
    python3 scripts/set-dl-mirror.py --verify

已实测的镜像（2026-10-10，64 位 macOS + 国内网络，绕开本机代理）
---------------------------------------------------------------
| 前缀                    | 21MB exe 全量 GET | 说明                       |
|-------------------------|-------------------|----------------------------|
| https://ghfast.top/     | 200，字节数一致，5.5 MB/s  | 当前选用                   |
| https://gh-proxy.com/   | 200，字节数一致，4.2 MB/s  | 备选                       |
| https://ghproxy.net/    | **半截响应**（1.3MB/21MB，无错） | 禁用：会下到残缺文件 |
| https://gh.llkk.cc/     | 连接失败          | 禁用                       |

即使镜像返回残缺/篡改内容，Tauri updater 也会在安装前用清单里的 minisign 签名校验失败并
拒绝安装（fail-closed），不会装入坏包；代价只是「更新报错」。所以选镜像主要看可用性与速度。

注意：`downloadUrl` 指向站点锚点（https://moon.jdk.plus#start），不是资产，不改写。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFESTS = ("latest.json", "version.json")
CANONICAL = "https://github.com/moon-doc/moon-doc.github.io/releases/download/"

# 需要改写前缀的字段位置：version.json 的两组下载链接 + latest.json 的平台 URL
URL_PATHS = (
    ("downloads", None),
    ("linuxDownloads", None),
    ("platforms", "url"),
)

_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # 绕开本机代理


def _urls_of(obj: dict) -> list[tuple[str, str]]:
    """返回 [(字段路径, url)]。"""
    found: list[tuple[str, str]] = []
    for key, sub in URL_PATHS:
        node = obj.get(key)
        if not isinstance(node, dict):
            continue
        if sub is None:
            for k, v in node.items():
                if isinstance(v, str) and v:
                    found.append((f"{key}.{k}", v))
        else:
            for k, v in node.items():
                if isinstance(v, dict) and isinstance(v.get(sub), str) and v[sub]:
                    found.append((f"{key}.{k}.{sub}", v[sub]))
    return found


def _strip(url: str) -> str:
    """去掉任意镜像前缀，恢复成规范 GitHub URL；非资产 URL 原样返回。"""
    i = url.find(CANONICAL)
    return url[i:] if i >= 0 else url


def rewrite(prefix: str) -> int:
    """就地套/去前缀。

    用 json 定位「哪些字段是资产 URL」，但**落盘走文本替换**：否则每次热修都会按
    json.dumps(indent=4) 把整份清单重排一遍（原文件是 2 空格缩进），diff 变成全文件
    重写、和 release.yml 里的生成器格式也打架。同一 URL 出现多次（如 darwin 两个
    架构共用一个 tarball）时一并替换——值相同，替换结果一致。
    """
    for name in MANIFESTS:
        path = REPO_ROOT / name
        raw = path.read_text(encoding="utf-8")
        obj = json.loads(raw)
        replaced = hits = 0
        # 去重后再改：同一 URL 可能被多个字段引用（darwin 两个架构共用一个 tarball、
        # downloads.linux 与 linuxDownloads.deb 可能是同一个包），不去重会在第二次
        # 处理时找不到原文而误报「找不到」。
        for url in dict.fromkeys(u for _f, u in _urls_of(obj)):
            canonical = _strip(url)
            new_url = prefix + canonical if prefix else canonical
            if new_url == url:
                continue
            old_lit = json.dumps(url, ensure_ascii=False)
            new_lit = json.dumps(new_url, ensure_ascii=False)
            n = raw.count(old_lit)
            if n == 0:
                print(f"[警告] {name}: 文本里找不到 {url}，跳过")
                continue
            raw = raw.replace(old_lit, new_lit)
            replaced += 1
            hits += n
        path.write_text(raw, encoding="utf-8")
        print(f"[改写] {name}: {replaced} 个 URL（{hits} 处）→ 前缀 {'(直链)' if not prefix else prefix}")
    return 0


def _fetch(url: str, method: str = "GET", timeout: int = 30) -> tuple[int, dict, bytes]:
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "moon-dl-mirror/1.0"})
    with _opener.open(req, timeout=timeout) as resp:
        body = resp.read() if method == "GET" else b""
        return resp.status, dict(resp.headers), body


def _release_sizes(tag: str) -> dict[str, int]:
    """GitHub Releases API 报告的资产名 → 字节数（用作校验基准）。"""
    api = f"https://api.github.com/repos/moon-doc/moon-doc.github.io/releases/tags/{tag}"
    _, _, body = _fetch(api)
    data = json.loads(body)
    return {a["name"]: a["size"] for a in data.get("assets", [])}


def verify(deep: bool = False) -> int:
    checked = failures = 0
    sizes: dict[str, int] = {}
    for name in MANIFESTS:
        path = REPO_ROOT / name
        if not path.exists():
            print(f"[跳过] {name} 不存在")
            continue
        obj = json.loads(path.read_text(encoding="utf-8"))
        tag = _strip(_urls_of(obj)[0][1]).split("/releases/download/")[-1].split("/")[0]
        if not sizes:
            try:
                sizes = _release_sizes(tag)
            except Exception as exc:  # noqa: BLE001 - 拿不到基准就只校验 HTTP 状态
                print(f"[警告] 无法取 Releases API 基准（{exc}），仅校验 HTTP 状态")
        print(f"\n=== {name} (tag {tag}) ===")
        for field, url in _urls_of(obj):
            if not url.startswith("http"):
                continue
            checked += 1
            fname = url.rsplit("/", 1)[-1]
            expect = sizes.get(fname)
            try:
                status, headers, _ = _fetch(url, timeout=40)
                got = headers.get("Content-Length")
                got_n = int(got) if got and got.isdigit() else None
                ok = status == 200 and (expect is None or got_n == expect)
                mark = "✓" if ok else "✗"
                detail = f"{status} len={got_n}"
                if expect is not None:
                    detail += f" 期望={expect}"
                if status == 200 and expect is not None and got_n is None:
                    detail += "（无 Content-Length，需完整下载才能确认）"
                if deep and status == 200:
                    _, _, body = _fetch(url, timeout=120)
                    if expect is not None and len(body) != expect:
                        ok = False
                        detail += f" 全量实际={len(body)}"
                print(f"  {mark} {field}: {detail}")
                failures += 0 if ok else 1
            except Exception as exc:  # noqa: BLE001
                failures += 1
                print(f"  ✗ {field}: {type(exc).__name__}: {exc}")
    print(f"\n[校验] {checked} 个 URL，失败 {failures} 个")
    return 1 if failures else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="切换/校验 moon 发布资产下载前缀")
    ap.add_argument("--mirror", help="镜像前缀（如 https://ghfast.top/）；none = 回到 GitHub 直链")
    ap.add_argument("--verify", action="store_true", help="只校验当前清单，不改写")
    ap.add_argument("--no-verify", action="store_true", help="改写后不校验（仅用于本地试改）")
    ap.add_argument("--deep", action="store_true", help="校验时额外完整下载比对字节数")
    args = ap.parse_args()

    if not args.verify:
        if args.mirror is None:
            ap.error("需要 --mirror <前缀|none> 或 --verify")
        prefix = "" if args.mirror.lower() in ("none", "-", "") else args.mirror.rstrip("/") + "/"
        rewrite(prefix)
    return 0 if args.no_verify else verify(deep=args.deep)


if __name__ == "__main__":
    sys.exit(main())
