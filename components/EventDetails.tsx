"use client";

import type { AnyItem } from "@/lib/trip";

interface Props {
  item: AnyItem;
  onShowOnMap: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0))
    return null;
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="w-24 shrink-0 font-title text-[9px] tracking-[0.25em] text-[var(--cream-soft)]">
        {label}
      </div>
      <div className="min-w-0 flex-1 text-[12px] leading-relaxed text-[var(--cream)]">
        {value}
      </div>
    </div>
  );
}

function fmtTime(iso?: string): string {
  if (!iso) return "";
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export default function EventDetails({ item, onShowOnMap }: Props) {
  const docs =
    "documents" in item && item.documents ? item.documents : undefined;

  return (
    <div className="relative mx-1 mb-2 mt-1 rounded-lg border border-[rgba(212,168,75,0.35)] bg-[rgba(11,24,40,0.55)] px-3 py-3">
      {item.type === "flight" && (
        <>
          <Row label="便名" value={item.flightNumbers.join(" · ")} />
          <Row label="航空会社" value={item.airline} />
          <Row
            label="出発"
            value={`${item.from.city}${item.from.airport ? ` (${item.from.airport})` : ""} · ${fmtTime(item.departure)}`}
          />
          <Row
            label="到着"
            value={`${item.to.city}${item.to.airport ? ` (${item.to.airport})` : ""} · ${fmtTime(item.arrival)}`}
          />
          <Row label="予約番号" value={item.bookingRef ?? "—"} />
          <Row label="クラス" value={item.class} />
          <Row
            label="座席"
            value={
              item.seats
                ? Object.entries(item.seats)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" / ")
                : undefined
            }
          />
          <Row label="経由" value={item.stops?.join(" → ")} />
          <Row label="受託手荷物" value={item.checkedBag} />
          <Row label="所要時間" value={item.duration} />
          <Row label="搭乗者" value={item.traveler} />
          <Row label="メモ" value={item.note} />
        </>
      )}

      {item.type === "train" && (
        <>
          <Row label="列車" value={`${item.operator} · ${item.trainNumber}`} />
          <Row
            label="出発"
            value={`${item.from.station ?? item.from.city} · ${fmtTime(item.departure)}`}
          />
          <Row
            label="到着"
            value={`${item.to.station ?? item.to.city} · ${fmtTime(item.arrival)}`}
          />
          <Row label="予約番号" value={item.bookingRef} />
          <Row label="クラス" value={item.class} />
          <Row
            label="座席"
            value={
              typeof item.seats === "string"
                ? item.seats
                : item.seats
                  ? Object.entries(item.seats)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" / ")
                  : undefined
            }
          />
          <Row
            label="チケット番号"
            value={item.ticketNumbers?.join(" / ")}
          />
          <Row label="コード" value={item.ticketCodes?.join(" / ")} />
          <Row label="キャンセル" value={item.cancellation} />
          <Row label="搭乗者" value={item.traveler} />
        </>
      )}

      {item.type === "hotel" && (
        <>
          <Row label="宿泊施設" value={item.name} />
          <Row label="住所" value={item.address} />
          <Row label="電話" value={item.contact} />
          <Row label="予約番号" value={item.bookingRef ?? "—"} />
          <Row label="PIN" value={item.pin} />
          <Row label="宿泊者名" value={item.guestName} />
          <Row label="ベッド" value={item.beds} />
          <Row label="料金" value={item.price} />
          <Row label="評価" value={item.rating ? `★ ${item.rating}` : undefined} />
          <Row
            label="チェックイン"
            value={`${item.checkIn}${item.nights ? ` · ${item.nights}泊` : ""}`}
          />
          <Row label="チェックアウト" value={item.checkOut} />
          <Row label="メモ" value={item.note} />
        </>
      )}

      {item.type === "event" && (
        <>
          <Row label="会場" value={item.venue} />
          <Row label="住所" value={item.address} />
          <Row label="日時" value={`${item.date} · ${item.time}`} />
          <Row label="所要時間" value={item.duration} />
          <Row label="メモ" value={item.note} />
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onShowOnMap}
          className="rounded-full border border-[var(--gold)] bg-[rgba(232,197,114,0.08)] px-3 py-1.5 font-title text-[10px] tracking-[0.3em] text-[var(--gold)]"
        >
          📍 地図で見る
        </button>
        {docs?.map((d, i) => (
          <a
            key={i}
            href={`/viewer?file=${encodeURIComponent(d.url)}&label=${encodeURIComponent(d.label)}`}
            className="rounded-full border border-[rgba(212,168,75,0.5)] px-3 py-1.5 font-title text-[10px] tracking-[0.3em] text-[var(--gold)] hover:bg-[rgba(232,197,114,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            {d.label}
          </a>
        ))}
      </div>
    </div>
  );
}
