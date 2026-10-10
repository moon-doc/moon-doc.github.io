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

官网 index.html 的下载按钮走同一批 URL（发版时由 release.yml 按序重写，所以**只在热修
清单时**会落后于清单——点官网下载同样下不动），本脚本一并改写与校验。

用法
----
    # 换到某个镜像（改写两份清单 + 官网下载按钮，然后校验）
    python3 scripts/set-dl-mirror.py --mirror https://ghfast.top/

    # 回到 GitHub 直链（大陆不可用，仅用于排障对照）
    python3 scripts/set-dl-mirror.py --mirror none

    # 只校验（清单 + 官网按钮），不改写；默认只发 HEAD，--deep 才完整下载比对
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
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFESTS = ("latest.json", "version.json")
CANONICAL = "https://github.com/moon-doc/moon-doc.github.io/releases/download/"

# index.html 的下载按钮：与 release.yml 里重写 href 的正则保持一致（同一形状）
HTML = "index.html"
HTML_BTN = re.compile(r'(<a\s+class="download-btn"\s+href=")([^"]*)(")')

# 需要改写前缀的字段位置：version.json 的两组下载链接 + latest.json 的平台 URL
URL_PATHS = (
    ("downloads", None),
    ("linuxDownloads", None),
    ("platforms", "url"),
)

_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # 绕开本机代理
UA = "moon-dl-mirror/1.0"


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


def _html_urls(raw: str) -> list[tuple[str, str]]:
    """index.html 下载按钮里的资产 URL：[(按钮标签, url)]；站点锚点等非资产项跳过。"""
    return [
        (f"{HTML}:btn{i}", m.group(2))
        for i, m in enumerate(HTML_BTN.finditer(raw), 1)
        if CANONICAL in m.group(2)
    ]


def _rewrite_html(prefix: str) -> int:
    """就地套/去 index.html 下载按钮的前缀（只动指向 release 资产的 href）。"""
    path = REPO_ROOT / HTML
    raw = path.read_text(encoding="utf-8")
    replaced = 0

    def sub(m: re.Match[str]) -> str:
        nonlocal replaced
        old = m.group(2)
        if CANONICAL not in old:  # 站点锚点（PAGES_BASE#start）等，原样保留
            return m.group(0)
        new = (prefix + _strip(old)) if prefix else _strip(old)
        if new != old:
            replaced += 1
        return m.group(1) + new + m.group(3)

    new_raw = HTML_BTN.sub(sub, raw)
    if new_raw != raw:
        path.write_text(new_raw, encoding="utf-8")
    print(f"[改写] {HTML}: {replaced} 个下载按钮 → 前缀 {'(直链)' if not prefix else prefix}")
    return replaced


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
    if (REPO_ROOT / HTML).exists():
        _rewrite_html(prefix)
    return 0


def _fetch(url: str, method: str = "GET", timeout: int = 30) -> tuple[int, dict, bytes]:
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    with _opener.open(req, timeout=timeout) as resp:
        body = resp.read() if method == "GET" else b""
        return resp.status, dict(resp.headers), body


def _size_probe(url: str, timeout: int = 40) -> tuple[int, int | None]:
    """(状态码, 资产总字节数)。只发 HEAD，绝不下载正文。

    这里原来走的是 `_fetch(url)`——默认 GET，为了读一个 Content-Length 而把整个资产
    拉下来：实测一轮 `--verify` 因此跑掉 227 秒（含 104MB AppImage）。镜像若不给 HEAD，
    退化成「0 字节 Range」探针，从 Content-Range 读总大小（ghfast.top 实测两者都支持：
    HEAD `200 len=21850092`；Range `206 bytes 0-0/21850092`）。
    """
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
        with _opener.open(req, timeout=timeout) as resp:
            cl = resp.headers.get("Content-Length")
            return resp.status, int(cl) if cl and cl.isdigit() else None
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 404, 410) or exc.code < 400:
            raise
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Range": "bytes=0-0"})
        with _opener.open(req, timeout=timeout) as resp:
            total = resp.headers.get("Content-Range", "").rsplit("/", 1)[-1]
            return resp.status, int(total) if total.isdigit() else None


def _release_sizes(tag: str) -> dict[str, int]:
    """GitHub Releases API 报告的资产名 → 字节数（用作校验基准）。"""
    api = f"https://api.github.com/repos/moon-doc/moon-doc.github.io/releases/tags/{tag}"
    _, _, body = _fetch(api)
    data = json.loads(body)
    return {a["name"]: a["size"] for a in data.get("assets", [])}


def verify(deep: bool = False) -> int:
    checked = failures = 0
    sizes: dict[str, int] = {}
    tag = "?"
    # 收集全部资产 URL（清单 + 官网按钮）并按 URL 去重：同一 tarball 常被多处引用，
    # 逐字段下载会重复拉一遍大文件。顺带把「官网按钮是否跟上了清单」一并暴露出来
    # ——按钮落后时它会以 github 直链出现，在大陆网络下必然校验失败。
    entries: dict[str, list[str]] = {}
    for name in MANIFESTS:
        path = REPO_ROOT / name
        if not path.exists():
            print(f"[跳过] {name} 不存在")
            continue
        obj = json.loads(path.read_text(encoding="utf-8"))
        urls = _urls_of(obj)
        if urls and tag == "?":
            tag = _strip(urls[0][1]).split("/releases/download/")[-1].split("/")[0]
        for field, url in urls:
            entries.setdefault(url, []).append(f"{name}:{field}")
    if (REPO_ROOT / HTML).exists():
        for field, url in _html_urls((REPO_ROOT / HTML).read_text(encoding="utf-8")):
            entries.setdefault(url, []).append(field)

    if tag != "?":
        try:
            sizes = _release_sizes(tag)
        except Exception as exc:  # noqa: BLE001 - 拿不到基准就只校验 HTTP 状态
            print(f"[警告] 无法取 Releases API 基准（{exc}），仅校验 HTTP 状态")

    print(f"\n=== 校验 {len(entries)} 个资产 URL（去重后，tag {tag}）===")
    for url, fields in entries.items():
        where = "|".join(fields)
        if not url.startswith("http"):
            continue
        checked += 1
        fname = url.rsplit("/", 1)[-1]
        expect = sizes.get(fname)
        try:
            status, got_n = _size_probe(url)
            ok = status in (200, 206) and (expect is None or got_n == expect)
            mark = "✓" if ok else "✗"
            detail = f"{status} len={got_n}"
            if expect is not None:
                detail += f" 期望={expect}"
            if status in (200, 206) and expect is not None and got_n is None:
                detail += "（拿不到总大小，需 --deep 完整下载才能确认）"
            if deep and status in (200, 206):
                _, _, body = _fetch(url, timeout=300)
                if expect is not None and len(body) != expect:
                    ok = False
                    detail += f" 全量实际={len(body)}"
            print(f"  {mark} {where}: {detail}")
            failures += 0 if ok else 1
        except Exception as exc:  # noqa: BLE001
            failures += 1
            print(f"  ✗ {where}: {type(exc).__name__}: {exc}")
    print(f"\n[校验] {checked} 个 URL，失败 {failures} 个")
    return 1 if failures else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="切换/校验 moon 发布资产下载前缀")
    ap.add_argument("--mirror", help="镜像前缀（如 https://ghfast.top/）；none = 回到 GitHub 直链")
    ap.add_argument("--verify", action="store_true", help="只校验（清单 + 官网按钮），不改写")
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
