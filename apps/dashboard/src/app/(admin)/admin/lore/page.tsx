"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button, Card, Input, Modal } from "@/components/ui";
import { CLEARANCE_CONFIG, type ClearanceLevel } from "@/components/lore/types";
import { cn } from "@/lib/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/** API 응답 문서 메타 (DB 컬럼명 기준) */
type DocMeta = {
  id: string;
  title: string;
  slug: string;
  clearance_level: ClearanceLevel;
  order_index: number;
};

/** 폼 상태 */
type FormState = {
  title: string;
  slug: string;
  clearanceLevel: ClearanceLevel;
  content: string;
  contentTab: "upload" | "edit";
};

const DEFAULT_FORM: FormState = {
  title: "",
  slug: "",
  clearanceLevel: 1,
  content: "",
  contentTab: "edit",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

type LoadState = "loading" | "ready" | "error";

export default function AdminLorePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DocMeta | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── 목록 불러오기 ── */
  const loadDocs = useCallback(async () => {
    setLoadState("loading");
    const res = await fetch("/api/admin/lore");
    if (!res.ok) {
      setLoadState("error");
      return;
    }
    const body = (await res.json()) as { data?: DocMeta[] };
    setDocs(body.data ?? []);
    setLoadState("ready");
  }, []);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  /* ── 폼 열기 ── */
  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (doc: DocMeta) => {
    setEditTarget(doc);
    setForm({
      title: doc.title,
      slug: doc.slug,
      clearanceLevel: doc.clearance_level,
      content: "",
      contentTab: "edit",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormError(null);
  };

  /* ── 제목 → 슬러그 자동 생성 ── */
  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editTarget ? prev.slug : slugify(value),
    }));
  };

  /* ── 파일 업로드 ── */
  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setForm((prev) => ({ ...prev, content: text }));
      }
    };
    reader.readAsText(file);
  };

  /* ── 저장 ── */
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setFormError("제목과 슬러그는 필수입니다.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const isEdit = editTarget !== null;
      const url = isEdit ? `/api/admin/lore/${editTarget.id}` : "/api/admin/lore";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        clearanceLevel: form.clearanceLevel,
        orderIndex: isEdit ? editTarget.order_index : docs.length,
        ...(form.content ? { content: form.content } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setFormError("슬러그가 이미 사용 중입니다. 다른 슬러그를 입력해주세요.");
        return;
      }
      if (res.status === 400) {
        setFormError("필수 항목이 누락되었습니다.");
        return;
      }
      if (!res.ok) {
        setFormError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      closeForm();
      await loadDocs();
    } catch {
      setFormError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 삭제 ── */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/lore/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteError("삭제에 실패했습니다. 다시 시도해주세요.");
        setConfirmingDeleteId(null);
        return;
      }
      setConfirmingDeleteId(null);
      await loadDocs();
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다.");
      setConfirmingDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── 렌더 ── */
  return (
    <>
      <section className="py-6 space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="hud-label mb-1">ADMIN / LORE</p>
            <h1 className="text-xl font-bold text-text">Lore 문서 관리</h1>
          </div>
          <Button size="sm" onClick={openCreate}>
            새 문서
          </Button>
        </div>

        {/* 삭제 오류 메시지 */}
        {deleteError && (
          <p className="text-xs text-accent">{deleteError}</p>
        )}

        {/* 목록 카드 */}
        <Card hud className="overflow-x-auto">
          {loadState === "loading" && (
            <p className="text-sm text-text-secondary">불러오는 중...</p>
          )}
          {loadState === "error" && (
            <p className="text-sm text-accent">문서 목록을 불러오지 못했습니다.</p>
          )}
          {loadState === "ready" && docs.length === 0 && (
            <p className="text-sm text-text-secondary">
              {/* 의도적 빈 목록 — 아직 등록된 Lore 문서가 없습니다 */}
              아직 등록된 Lore 문서가 없습니다.
            </p>
          )}
          {loadState === "ready" && docs.length > 0 && (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="px-2 py-2">순서</th>
                  <th className="px-2 py-2">제목</th>
                  <th className="px-2 py-2">슬러그</th>
                  <th className="px-2 py-2">기밀 등급</th>
                  <th className="px-2 py-2">액션</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const cfg = CLEARANCE_CONFIG[doc.clearance_level];
                  const isDeleting = deletingId === doc.id;
                  return (
                    <tr key={doc.id} className="border-b border-border/60 align-middle">
                      <td className="px-2 py-3 text-text-secondary">{doc.order_index}</td>
                      <td className="px-2 py-3 font-medium text-text">{doc.title}</td>
                      <td className="px-2 py-3 text-text-secondary font-mono text-xs">
                        {doc.slug}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={cn(
                            "text-xs font-semibold border rounded px-1.5 py-0.5",
                            cfg.textColor,
                            cfg.borderColor,
                          )}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex gap-2 flex-wrap items-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEdit(doc)}
                          >
                            편집
                          </Button>
                          {confirmingDeleteId === doc.id ? (
                            <>
                              <span className="text-xs text-accent">삭제하시겠습니까?</span>
                              <Button
                                size="sm"
                                variant="danger"
                                loading={isDeleting}
                                onClick={() => void handleDelete(doc.id)}
                              >
                                확인
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmingDeleteId(null)}
                              >
                                취소
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmingDeleteId(doc.id)}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </section>

      {/* 생성/편집 모달 */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editTarget ? "Lore 문서 편집" : "새 Lore 문서"}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {/* 제목 */}
          <Input
            label="제목"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="세계 개요"
          />

          {/* 슬러그 */}
          <Input
            label="슬러그 (URL)"
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }
            placeholder="world-overview"
          />

          {/* 기밀 등급 */}
          <div>
            <p className="text-xs uppercase tracking-widest text-text-secondary mb-1.5">
              기밀 등급
            </p>
            <div className="flex gap-2">
              {([1, 2, 3] as ClearanceLevel[]).map((level) => {
                const cfg = CLEARANCE_CONFIG[level];
                const selected = form.clearanceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, clearanceLevel: level }))
                    }
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold border rounded transition-all",
                      cfg.borderColor,
                      cfg.textColor,
                      selected
                        ? "bg-current/10 ring-1 ring-current/30"
                        : "bg-transparent opacity-50 hover:opacity-80",
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 내용 탭 */}
          <div>
            <div className="flex gap-0 border-b border-border mb-3">
              <button
                type="button"
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                  form.contentTab === "upload"
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-text-secondary hover:text-text",
                )}
                onClick={() => setForm((prev) => ({ ...prev, contentTab: "upload" }))}
              >
                파일 업로드 .md
              </button>
              <button
                type="button"
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                  form.contentTab === "edit"
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-text-secondary hover:text-text",
                )}
                onClick={() => setForm((prev) => ({ ...prev, contentTab: "edit" }))}
              >
                직접 편집
              </button>
            </div>

            {form.contentTab === "upload" ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  .md 파일 선택
                </Button>
                {form.content && (
                  <p className="text-xs text-text-secondary">
                    {form.content.length.toLocaleString()}자 로드됨
                  </p>
                )}
              </div>
            ) : (
              <div data-color-mode="dark">
                <MDEditor
                  value={form.content}
                  onChange={(v) => setForm((prev) => ({ ...prev, content: v ?? "" }))}
                  height={300}
                  preview="edit"
                />
              </div>
            )}
            {editTarget && !form.content && (
              <p className="text-xs text-text-secondary mt-1">
                내용을 변경하지 않으면 기존 내용이 유지됩니다.
              </p>
            )}
          </div>

          {/* 에러 */}
          {formError && (
            <p className="text-xs text-accent">{formError}</p>
          )}

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={closeForm} type="button">
              취소
            </Button>
            <Button
              size="sm"
              loading={submitting}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {editTarget ? "저장" : "생성"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
