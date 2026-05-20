"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, NotebookPen, Pencil, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { Exercise } from "@/convex/types";
import { SetRow, type SetLog, type Units } from "./SetRow";
import { RPEChip } from "./RPEChip";
import { cx } from "@/lib/utils";

type SectionKey = "warmup" | "mainBlock" | "conditioningBlock" | "cooldown";

type Log = Doc<"exerciseLogs">;

/**
 * Parse "3 × 10" / "5 rounds" / "x8" → 3 / 5 / 8. Returns 1 if not parseable.
 * For check-type warmups we always render 1 row regardless.
 */
function prescribedSetCount(prescription: string, trackingType: string): number {
  if (trackingType === "check") return 1;
  const m =
    prescription.match(/(\d+)\s*[×x]/i) ??
    prescription.match(/^\s*(\d+)\s+rounds/i);
  if (m) return Math.max(1, Math.min(10, parseInt(m[1], 10)));
  return 1;
}

function defaultSets(exercise: Exercise, prev?: Log): SetLog[] {
  const count = prescribedSetCount(
    exercise.prescription,
    exercise.trackingType,
  );
  return Array.from({ length: count }, (_, i) => {
    const prevSet = prev?.sets?.[i];
    return {
      setNumber: i + 1,
      weight: prevSet?.weight,
      reps: prevSet?.reps,
      rpe: undefined,
      meters: prevSet?.meters,
      calories: prevSet?.calories,
      timeSeconds: prevSet?.timeSeconds,
      completed: false,
    } satisfies SetLog;
  });
}

export function ExerciseCard({
  exercise,
  sectionKey,
  log,
  prevLog,
  date,
  week,
  dayOfWeek,
  units = "lb",
  restSeconds = 90,
}: {
  exercise: Exercise;
  sectionKey: SectionKey;
  log: Log | null;
  prevLog: Log | null;
  date: string;
  week: number;
  dayOfWeek: number;
  units?: Units;
  restSeconds?: number;
}) {
  const upsert = useMutation(api.exerciseLogs.upsert);
  const updateExerciseName = useMutation(api.programDays.updateExerciseName);

  // If there's no log yet for today, project the prescribed empty sets
  // (pre-filled with prev values as starting suggestions).
  const sets: SetLog[] = log?.sets?.length
    ? (log.sets as SetLog[])
    : defaultSets(exercise, prevLog ?? undefined);
  const notes = log?.notes ?? "";

  const [open, setOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(!!notes);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(exercise.name);
  const [savingName, setSavingName] = useState(false);

  async function saveName() {
    const next = nameDraft.trim();
    if (!next || next === exercise.name) {
      setNameDraft(exercise.name);
      setRenaming(false);
      return;
    }
    setSavingName(true);
    await updateExerciseName({
      week,
      dayOfWeek,
      section: sectionKey,
      exerciseId: exercise.id,
      name: next,
    });
    setSavingName(false);
    setRenaming(false);
  }

  function cancelRename() {
    setNameDraft(exercise.name);
    setRenaming(false);
  }

  const completedSets = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;

  const save = async (nextSets: SetLog[], nextNotes?: string) => {
    await upsert({
      date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      week,
      dayOfWeek,
      sets: nextSets,
      notes: nextNotes ?? notes ?? undefined,
    });
  };

  const updateSet = (setNumber: number, patch: Partial<SetLog>) => {
    const next = sets.map((s) =>
      s.setNumber === setNumber ? { ...s, ...patch } : s,
    );
    save(next);
  };

  const updateNotes = (val: string) => {
    save(sets, val);
  };

  const prev = prevLog?.sets ?? [];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {renaming ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") cancelRename();
                  }}
                  className="font-semibold text-ink leading-tight bg-bg-elev border border-bg-line rounded px-2 py-0.5 flex-1 min-w-0 focus:outline-none focus:border-brand"
                  disabled={savingName}
                />
                <button
                  type="button"
                  onClick={saveName}
                  disabled={savingName}
                  className="h-7 w-7 rounded-lg flex items-center justify-center bg-brand text-white tap disabled:opacity-40"
                  aria-label="Save name"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={cancelRename}
                  disabled={savingName}
                  className="h-7 w-7 rounded-lg flex items-center justify-center bg-bg-elev text-ink-muted tap"
                  aria-label="Cancel rename"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(exercise.name);
                    setRenaming(true);
                  }}
                  className="flex items-center gap-1.5 text-left tap group"
                  aria-label="Rename exercise"
                >
                  <h3 className="font-semibold text-ink leading-tight">
                    {exercise.name}
                  </h3>
                  <Pencil
                    size={11}
                    className="text-ink-dim group-hover:text-ink-muted transition-colors shrink-0"
                  />
                </button>
                {exercise.pairGroup && (
                  <span
                    className="chip border bg-brand/15 text-brand border-brand/30"
                    aria-label={`Pair group ${exercise.pairGroup}`}
                  >
                    {exercise.pairGroup}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted flex-wrap">
            <span className="font-medium">{exercise.prescription}</span>
            {exercise.rpeTarget !== undefined && (
              <RPEChip
                rpe={
                  Array.isArray(exercise.rpeTarget)
                    ? (exercise.rpeTarget as [number, number])
                    : (exercise.rpeTarget as number)
                }
              />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-1 py-1 tap"
          aria-label={open ? "Collapse exercise" : "Expand exercise"}
        >
          <span className="text-xs text-ink-muted tabular-nums">
            {completedSets}/{totalSets}
          </span>
          {open ? (
            <ChevronUp size={18} className="text-ink-muted" />
          ) : (
            <ChevronDown size={18} className="text-ink-muted" />
          )}
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          {sets.map((s, idx) => (
            <SetRow
              key={s.setNumber}
              set={s}
              exercise={exercise}
              units={units}
              prevSet={prev[idx] as SetLog | undefined}
              onChange={(patch) => updateSet(s.setNumber, patch)}
              restSeconds={restSeconds}
            />
          ))}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowNotes((v) => !v)}
              className={cx(
                "btn text-xs py-2 px-3",
                showNotes ? "btn-primary" : "btn-outline",
              )}
              aria-label="Toggle notes"
            >
              <NotebookPen size={14} />
              {showNotes ? "hide notes" : "notes"}
            </button>
          </div>

          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Cues, form notes, feel…"
              className="w-full text-sm bg-bg border border-bg-line rounded-lg px-2.5 py-2 mt-1 focus:outline-none focus:border-brand"
              rows={2}
            />
          )}

          {exercise.note && (
            <div className="text-[10px] text-ink-dim italic">
              {exercise.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
