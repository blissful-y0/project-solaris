import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import type { ResonanceTask } from "./mock-tasks";
import { taskTypeVariant } from "./mock-tasks";

type ResonanceTasksProps = {
  tasks: ResonanceTask[];
};

export function ResonanceTasks({ tasks }: ResonanceTasksProps) {
  return (
    <section>
      {/* 헤더 */}
      <div className="mb-4">
        <p className="hud-label mb-1">MY RESONANCE TASKS</p>
        <p className="hud-label text-text-secondary">DIRECTIVE FROM HELIOS</p>
      </div>

      <Card hud>
        {tasks.length === 0 ? (
          <p className="text-sm text-text-secondary py-2">
            수신된 지시가 없습니다.
          </p>
        ) : (
          <ul role="list">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className={cn(
                  index < tasks.length - 1 && "border-b border-border",
                )}
              >
                <Link
                  href={task.route}
                  className="flex items-center gap-3 py-3 px-1 group transition-colors hover:bg-white/[0.03] rounded"
                >
                  {/* 타입 뱃지 */}
                  <Badge variant={taskTypeVariant[task.type]}>
                    {task.type}
                  </Badge>

                  {/* 메시지 + 건수 */}
                  <span className="flex-1 text-sm text-text truncate">
                    {task.message}
                    {task.count != null && (
                      <span className="ml-1 text-text-secondary">
                        ({task.count}건)
                      </span>
                    )}
                  </span>

                  {/* 화살표 */}
                  <span
                    className="text-text-secondary group-hover:text-primary transition-colors shrink-0"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
