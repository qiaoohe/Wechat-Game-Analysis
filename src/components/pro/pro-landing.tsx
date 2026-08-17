"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ContactGate } from "@/components/pro/contact-modal";
import { buttonVariants } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/site-seo";
import { cn, mutedLinkClass } from "@/lib/utils";

const DUTIES = [
  {
    title: "盯你的游戏",
    desc: "按你的关注名单监测榜单位次与异动，红灯优先提醒。",
  },
  {
    title: "盯你的竞品",
    desc: "对标竞品位次与位差，活跃时提示抽样素材与投放节奏。",
  },
  {
    title: "结论按时送达",
    desc: "轻日报雷达 + 可开会用的周报判断，并提供 1 对 1 专属在线管家（工作日）。",
  },
] as const;

const COMPARE_ROWS = [
  { label: "月成本", hire: "数千起（人力）", us: "¥999 起" },
  { label: "数据与整理", hire: "要自己爬、表、对齐", us: "榜单 / 热搜已就绪" },
  { label: "产出节奏", hire: "看人、看状态", us: "按日雷达 · 按周判断" },
  { label: "沟通方式", hire: "协调成本高", us: "1 对 1 专属管家（工作日）" },
] as const;

const PLANS = [
  {
    name: "单端助理",
    price: "999",
    desc: "微信小游戏或抖音小游戏任选一端",
    items: [
      "专属关注 / 竞品名单（建议各 ≤8 款）",
      "每日异动雷达（红黄灯 + 动作建议）",
      "每周市场判断 + 名单周报",
      "热搜词 / IP 周观察",
      "1 对 1 专属在线管家（工作日）",
    ],
    highlight: false,
    cta: "开通单端助理",
  },
  {
    name: "双端助理",
    price: "1599",
    desc: "微信小游戏 + 抖音小游戏同步盯",
    items: [
      "单端全部能力，覆盖双端",
      "两端名单与异动一并交付",
      "更适合发行与买量同时做两边",
      "1 对 1 专属在线管家（工作日）",
      "名额有限，优先保障交付质量",
    ],
    highlight: true,
    cta: "开通双端助理",
  },
] as const;

const FAQS = [
  {
    q: "这是请了一个真人全职助理吗？",
    a: "不是全职下属。是专属配置的情报助理：按你的名单监测、按约定节奏交付，并在工作日提供 1 对 1 在线管家沟通。专注榜单与竞品雷达，不含代投、素材制作或非工作时间无限答疑。",
  },
  {
    q: "和免费榜单有什么不同？",
    a: "免费站要自己查、自己判断。管家服务按你的名单筛完，异动标红黄灯，周报给可口述的市场判断，按时专属交付到你手上。",
  },
  {
    q: "单端和双端怎么选？",
    a: "只做一端选单端；微信小游戏和抖音小游戏都要盯选双端。服务形态相同，差别在平台覆盖。",
  },
  {
    q: "怎么开通？要注册付款吗？",
    a: "点击开通后留下意向与关注/竞品名单即可。确认后开通，按约定结算，无需先注册账号。",
  },
] as const;

interface ProLandingProps {
  wechat: string;
  note: string;
}

export function ProLanding({ wechat, note }: ProLandingProps) {
  return (
    <ContactGate wechat={wechat} note={note}>
      {(openContact) => (
        <div className="-mx-4 sm:-mx-6">
          {/* Hero：品牌 + 一句定位 + CTA */}
          <section className="relative overflow-hidden bg-[#f7f7f8]">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 90% 0%, rgba(224,77,78,0.08), transparent 55%)",
              }}
            />
            <div className="relative mx-auto max-w-3xl px-5 py-14 text-center sm:px-8 sm:py-20 lg:px-10">
              <p className="pro-rise text-sm font-semibold tracking-wide text-brand-text">
                {BRAND_NAME}
              </p>
              <h1 className="pro-rise-delay-1 mt-4 text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15]">
                你的专属小游戏情报助理
              </h1>
              <p className="pro-rise-delay-2 mx-auto mt-4 max-w-lg text-[15px] leading-7 text-slate-600 sm:text-base">
                按你的名单盯榜、盯竞品，异动提醒与周判断专属交付。相当于一位只负责小游戏情报的助理，工作日可
                1 对 1 在线沟通。
              </p>
              <div className="pro-rise-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openContact}
                  className={cn(buttonVariants({ size: "lg" }), "min-w-[9rem]")}
                >
                  开通专属助理
                </button>
                <a
                  href="#pricing"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "min-w-[9rem] bg-white",
                  )}
                >
                  查看方案
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <p className="mt-7 text-sm text-slate-500">
                <span className="font-medium text-slate-800">¥999</span>
                <span className="mx-1 text-slate-300">/</span>
                单端月
                <span className="mx-2.5 text-slate-300">·</span>
                <span className="font-medium text-slate-800">¥1599</span>
                <span className="mx-1 text-slate-300">/</span>
                双端月
              </p>
            </div>
          </section>

          {/* 三件事：桌面三列步骤，移动端时间线 */}
          <section className="border-t border-slate-200/70 bg-white">
            <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  开通后，助理替你做三件事
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-500">
                  面向发行、买量与投研。专属名单，按节奏交付与沟通。
                </p>
              </div>

              <ol className="mt-12 grid gap-0 md:grid-cols-3 md:gap-0">
                {DUTIES.map((item, index) => (
                  <li
                    key={item.title}
                    className={cn(
                      "relative flex gap-4 border-l-2 border-brand/25 py-1 pl-5 md:block md:border-l-0 md:px-6 md:py-0 md:pl-6",
                      index === 0 && "md:pl-0",
                      index === DUTIES.length - 1 && "md:pr-0",
                      index > 0 &&
                        "mt-8 md:mt-0 md:border-l md:border-slate-200/80",
                    )}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white md:mb-5 md:mt-0 md:h-10 md:w-10 md:text-base"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 md:pr-2">
                      <p className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-[15px]">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 对比：雇人 vs 管家 */}
          <section className="border-t border-slate-200/70 bg-[#f7f7f8]">
            <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
              <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                比自己招人更划算
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-7 text-slate-500">
                不是全职下属，而是一位只盯小游戏榜单与竞品的情报助理。
              </p>
              <div className="mt-10 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200/70">
                <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500">
                      <th
                        scope="col"
                        className="w-[22%] px-4 py-3.5 font-semibold sm:px-5"
                      >
                        <span className="sr-only">对比项</span>
                      </th>
                      <th
                        scope="col"
                        className="w-[39%] px-4 py-3.5 font-semibold sm:px-5"
                      >
                        自己招助理
                      </th>
                      <th
                        scope="col"
                        className="w-[39%] px-4 py-3.5 font-semibold text-brand-text sm:px-5"
                      >
                        {BRAND_NAME} 助理
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <th
                          scope="row"
                          className="px-4 py-3.5 align-top font-medium text-slate-800 sm:px-5"
                        >
                          {row.label}
                        </th>
                        <td className="px-4 py-3.5 align-top leading-6 text-slate-500 sm:px-5">
                          {row.hire}
                        </td>
                        <td className="px-4 py-3.5 align-top leading-6 font-medium text-slate-900 sm:px-5">
                          {row.us}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 定价 */}
          <section
            id="pricing"
            className="scroll-mt-24 border-t border-slate-200/70 bg-white"
          >
            <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  选择你的专属助理
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-500">
                  服务内容相同，按覆盖平台计费。确认名单后开通，按约定节奏专属交付。
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl p-6 sm:p-7",
                      plan.highlight
                        ? "bg-brand-soft/60 ring-1 ring-brand/25"
                        : "bg-[#f7f7f8] ring-1 ring-slate-200/70",
                    )}
                  >
                    {plan.highlight ? (
                      <span className="absolute right-5 top-5 text-[11px] font-semibold tracking-wide text-brand-text">
                        推荐
                      </span>
                    ) : null}
                    <p className="text-sm font-medium text-slate-500">
                      {plan.name}
                    </p>
                    <p className="mt-3 flex items-baseline gap-1 text-slate-900">
                      <span className="text-sm font-medium text-slate-500">
                        ¥
                      </span>
                      <span className="text-4xl font-semibold tracking-tight tabular-nums">
                        {plan.price}
                      </span>
                      <span className="text-sm text-slate-500">/ 月</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{plan.desc}</p>
                    <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-6 text-slate-600">
                      {plan.items.map((line) => (
                        <li key={line} className="flex gap-2">
                          <Check
                            className="mt-1 h-4 w-4 shrink-0 text-brand"
                            aria-hidden
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={openContact}
                      className={cn(
                        buttonVariants({
                          size: "lg",
                          variant: plan.highlight ? "default" : "outline",
                        }),
                        "mt-7 w-full",
                        !plan.highlight && "bg-white",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-center text-sm text-slate-500">
                免费站可先感受数据样例：
                <Link
                  href="/rankings"
                  className="ml-1 font-medium text-slate-800 underline-offset-4 hover:text-brand hover:underline"
                >
                  榜单
                </Link>
                <span className="mx-1.5 text-slate-300">/</span>
                <Link
                  href="/insights/hot-words"
                  className="font-medium text-slate-800 underline-offset-4 hover:text-brand hover:underline"
                >
                  热搜词
                </Link>
                <span className="mx-1.5 text-slate-300">/</span>
                <Link
                  href="/rising"
                  className="font-medium text-slate-800 underline-offset-4 hover:text-brand hover:underline"
                >
                  增速
                </Link>
              </p>
            </div>
          </section>

          <section className="border-t border-slate-200/70 bg-[#f7f7f8]">
            <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
              <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                常见问题
              </h2>
              <div className="mt-8 divide-y divide-slate-200/80 rounded-2xl bg-white px-5 ring-1 ring-slate-200/70 sm:px-6">
                {FAQS.map((item) => (
                  <details key={item.q} className="group py-4">
                    <summary className="cursor-pointer list-none text-[15px] font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {item.q}
                        <span className="text-lg font-light text-slate-300 transition group-open:rotate-45 group-open:text-brand">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-2.5 text-sm leading-7 text-slate-500">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>

              <div className="mt-10 px-1 text-center sm:px-2">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  把盯榜这件事交给助理
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                  说明单端或双端，以及要盯的游戏与竞品。确认名单后开通专属助理与工作日在线管家。
                </p>
                <button
                  type="button"
                  onClick={openContact}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-6 min-w-[10rem]",
                  )}
                >
                  开通专属助理
                </button>
              </div>

              <p className="mt-8 text-center">
                <Link href="/" className={`${mutedLinkClass} text-sm`}>
                  返回首页
                </Link>
              </p>
            </div>
          </section>
        </div>
      )}
    </ContactGate>
  );
}
