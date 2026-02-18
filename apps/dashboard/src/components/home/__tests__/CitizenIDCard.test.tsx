import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CitizenIDCard } from "../CitizenIDCard";
import type { CitizenData } from "../mock-citizen";

const { mockUploadToSignedUrl, mockToastError, mockToastSuccess, mockNextImage } = vi.hoisted(() => ({
  mockUploadToSignedUrl: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockNextImage: vi.fn((props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { priority, unoptimized, ...domProps } = props as React.ImgHTMLAttributes<HTMLImageElement> & {
      priority?: boolean;
      unoptimized?: boolean;
    };
    void priority;
    void unoptimized;
    return <img {...domProps} />;
  }),
}));

vi.mock("next/image", () => ({
  default: mockNextImage,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        uploadToSignedUrl: mockUploadToSignedUrl,
      }),
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

/* ─── next/link 모킹 ─── */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/* ─── 테스트용 시민 데이터 ─── */
const baseCitizen: CitizenData = {
  name: "아마츠키 레이",
  faction: "Bureau",
  resonanceRate: 87,
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  citizenId: "SCC-7291-0483",
  avatarUrl: null,
  abilityClass: "역장 (Field)",
  joinDate: "2026-01-15",
};

describe("CitizenIDCard", () => {
  mockUploadToSignedUrl.mockResolvedValue({ error: null });

  const createImageBitmapMock = vi.fn();
  vi.stubGlobal("createImageBitmap", createImageBitmapMock);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => ({ drawImage: vi.fn() }) as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback: BlobCallback) => {
    callback(new Blob(["cropped"], { type: "image/webp" }));
  });

  describe("등록된 시민 카드", () => {
    it("시민 이름을 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
    });

    it("SOLARIS CITIZEN ID 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("SOLARIS CITIZEN ID")).toBeInTheDocument();
    });

    it("Bureau 소속 풀네임을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("Solaris Bureau of Civic Security")).toBeInTheDocument();
    });

    it("Static 소속명을 표시한다", () => {
      const staticCitizen: CitizenData = { ...baseCitizen, faction: "Static" };
      render(<CitizenIDCard citizen={staticCitizen} />);
      expect(screen.getByText("The Static")).toBeInTheDocument();
    });

    it("공명율을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("87%")).toBeInTheDocument();
    });

    it("공명율 >= 70이면 시안 컬러를 적용한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const rr = screen.getByText("87%");
      expect(rr).toHaveClass("text-primary");
    });

    it("공명율 < 40이면 레드 컬러를 적용한다", () => {
      const lowRR: CitizenData = { ...baseCitizen, resonanceRate: 25 };
      render(<CitizenIDCard citizen={lowRR} />);
      const rr = screen.getByText("25%");
      expect(rr).toHaveClass("text-accent");
    });

    it("HP 게이지를 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const hpBar = screen.getByRole("progressbar", { name: /HP 64\/80/ });
      expect(hpBar).toBeInTheDocument();
    });

    it("WILL 게이지를 렌더링한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const willBar = screen.getByRole("progressbar", { name: /WILL 198\/250/ });
      expect(willBar).toBeInTheDocument();
    });

    it("HP 수치를 텍스트로 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("64/80")).toBeInTheDocument();
    });

    it("WILL 수치를 텍스트로 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("198/250")).toBeInTheDocument();
    });

    it("카드 번호를 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("SCC-7291-0483")).toBeInTheDocument();
    });

    it("RESONANCE RATE 라벨을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("RESONANCE RATE")).toBeInTheDocument();
    });

    it("능력 계열을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("역장 (Field)")).toBeInTheDocument();
    });

    it("등록일을 표시한다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("REG 2026-01-15")).toBeInTheDocument();
    });

    it("소속 풀네임이 이름 아래에 표시된다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      expect(screen.getByText("Solaris Bureau of Civic Security")).toBeInTheDocument();
    });

    it("아바타 업로드 시 서버 avatar API를 호출한다", async () => {
      createImageBitmapMock.mockResolvedValue({ width: 512, height: 640, close: vi.fn() });
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ path: "user-1/char_001/file.jpg", token: "signed-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ url: "https://example.com/new-avatar.jpg" }),
        });
      vi.stubGlobal("fetch", mockFetch);

      const citizenWithCharacterId: CitizenData = {
        ...baseCitizen,
        characterId: "char_001",
      };

      render(<CitizenIDCard citizen={citizenWithCharacterId} />);
      const input = screen.getByLabelText("프로필 이미지 변경")
        .parentElement
        ?.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });

      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(await screen.findByRole("button", { name: "확정" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/characters/char_001/avatar",
          expect.objectContaining({
            method: "POST",
            body: expect.any(String),
          }),
        );
      });

      expect(mockUploadToSignedUrl).toHaveBeenCalledWith(
        "user-1/char_001/file.jpg",
        "signed-token",
        expect.any(File),
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/characters/char_001/avatar",
        expect.objectContaining({
          method: "PATCH",
          body: expect.any(String),
        }),
      );
    });

    it("아바타 렌더링에 화질 보존 옵션을 적용한다", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const citizenWithAvatar: CitizenData = {
        ...baseCitizen,
        avatarUrl: "https://jasjvfkbprkzxhsnxstd.supabase.co/storage/v1/object/public/character-profile-images/a.jpg",
      };
      render(<CitizenIDCard citizen={citizenWithAvatar} />);

      expect(mockNextImage).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: 100,
          unoptimized: true,
        }),
        undefined,
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("최소 해상도 미달 이미지는 업로드를 막는다", async () => {
      createImageBitmapMock.mockResolvedValue({ width: 200, height: 200, close: vi.fn() });
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const citizenWithCharacterId: CitizenData = {
        ...baseCitizen,
        characterId: "char_001",
      };

      render(<CitizenIDCard citizen={citizenWithCharacterId} />);
      const input = screen.getByLabelText("프로필 이미지 변경")
        .parentElement
        ?.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("크롭 확정 전에는 업로드를 시작하지 않는다", async () => {
      createImageBitmapMock.mockResolvedValue({ width: 512, height: 640, close: vi.fn() });
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ path: "user-1/char_001/file.webp", token: "signed-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ url: "https://example.com/new-avatar.webp" }),
        });
      vi.stubGlobal("fetch", mockFetch);

      const citizenWithCharacterId: CitizenData = {
        ...baseCitizen,
        characterId: "char_001",
      };

      render(<CitizenIDCard citizen={citizenWithCharacterId} />);
      const input = screen.getByLabelText("프로필 이미지 변경")
        .parentElement
        ?.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(await screen.findByRole("dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "확정" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/characters/char_001/avatar",
          expect.objectContaining({ method: "POST" }),
        );
      });
    });
  });

  describe("HP/WILL StatBar 스타일", () => {
    it("HP 게이지가 그라디언트 스타일이다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const hpBar = screen.getByRole("progressbar", { name: /HP/ });
      const fill = hpBar.querySelector("div");
      expect(fill?.className).toContain("bg-gradient-to-r");
    });

    it("WILL 게이지가 그라디언트 스타일이다", () => {
      render(<CitizenIDCard citizen={baseCitizen} />);
      const willBar = screen.getByRole("progressbar", { name: /WILL/ });
      const fill = willBar.querySelector("div");
      expect(fill?.className).toContain("bg-gradient-to-r");
    });
  });

  describe("빈 카드 (미등록)", () => {
    it("citizen이 null이면 빈 카드를 렌더링한다", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("미확인 시민")).toBeInTheDocument();
    });

    it("아바타 자리에 ? 표시", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("RR/HP/WILL 빈 프로그레스 바를 표시한다", () => {
      render(<CitizenIDCard citizen={null} />);
      const meters = screen.getAllByRole("meter");
      expect(meters).toHaveLength(3);
    });

    it("캐릭터 생성 링크가 /character/create로 이동한다", () => {
      render(<CitizenIDCard citizen={null} />);
      const link = screen.getByRole("link", { name: /캐릭터 생성/ });
      expect(link).toHaveAttribute("href", "/character/create");
    });

    it("CTA 텍스트를 표시한다", () => {
      render(<CitizenIDCard citizen={null} />);
      expect(screen.getByText("NEW OPERATIVE REQUIRED")).toBeInTheDocument();
    });
  });
});
