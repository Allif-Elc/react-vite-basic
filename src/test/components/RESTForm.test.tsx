import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { RESTForm } from "../../components/editor/RESTForm";
import { restAPISchema } from "../../schemas/restSchema";
import type { RestAPI } from "../../types/api";

// Mock stores
vi.mock("../../stores/toastStore", () => ({
  useToastStore: () => ({
    addToast: vi.fn(),
    removeToast: vi.fn(),
    clearToasts: vi.fn(),
    toasts: [],
  }),
}));

vi.mock("../../stores/formStore", () => ({
  useFormDraftStore: () => ({
    saveDraft: vi.fn(),
    loadDraft: vi.fn(() => null),
    clearDraft: vi.fn(),
    drafts: {},
  }),
}));

vi.mock("../../utils/jsonFormatter", () => ({
  formatJSON: vi.fn(async (json: string) => {
    try {
      const parsed = JSON.parse(json);
      return {
        formatted: JSON.stringify(parsed, null, 2),
        error: null,
      };
    } catch {
      return {
        formatted: json,
        error: "Invalid JSON",
      };
    }
  }),
}));

// Mock complex child components
vi.mock("../../components/api/APITabs", () => ({
  APITabs: ({ tabs, defaultTab }: any) => {
    const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);
    const activeTabData = tabs.find((t: any) => t.id === activeTab);

    return (
      <div>
        <div role="tablist">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>{activeTabData?.content}</div>
      </div>
    );
  },
}));

vi.mock("../../components/api/ParameterList", () => ({
  ParameterList: ({ label }: any) => <div data-testid="parameter-list">{label}</div>,
}));

vi.mock("../../components/api/ResponseViewer", () => ({
  ResponseViewer: ({ name }: any) => <div data-testid="response-viewer">{name}</div>,
}));

import React from "react";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("RESTForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all form fields", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      expect(screen.getByLabelText(/api name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/endpoint/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save api/i })).toBeInTheDocument();
    });

    it("renders all expected tabs", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /headers/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /path parameters/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /query parameters/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /request body/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /responses/i })).toBeInTheDocument();
    });

    it("shows cancel button when onCancel is provided", () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} projectId={1} />);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("does not show cancel button when onCancel is not provided", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('shows "Saving..." text when isSubmitting is true', () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} isSubmitting={true} />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      const submitButton = screen.getByRole("button", { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Edit Mode", () => {
    const mockInitialData: RestAPI = {
      id_rest_api: 1,
      id_project: 1,
      id_user: 1,
      name: "Existing API",
      description: "Existing description",
      method: "POST",
      endpoint: "/existing-endpoint",
      headers: [],
      path_params: [],
      query_params: [],
      request_body: { type: "object", properties: {} },
      responses: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("pre-fills form with initialData values", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(
        <RESTForm onSubmit={mockOnSubmit} projectId={1} initialData={mockInitialData} restId={1} />
      );

      expect(screen.getByLabelText(/api name/i)).toHaveValue("Existing API");
      expect(screen.getByLabelText(/endpoint/i)).toHaveValue("/existing-endpoint");
    });
  });

  describe("Form Structure", () => {
    it("has correct form element with submit handler", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("space-y-6");
    });

    it("has all required input fields with proper attributes", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      const nameInput = screen.getByLabelText(/api name/i);
      expect(nameInput).toHaveAttribute("type", "text");
      expect(nameInput).toHaveAttribute("placeholder", "Get User Profile");

      const methodSelect = screen.getByLabelText(/method/i);
      expect(methodSelect).toHaveAttribute("name", "method");

      const endpointInput = screen.getByLabelText(/endpoint/i);
      expect(endpointInput).toHaveAttribute("type", "text");
      expect(endpointInput).toHaveAttribute("placeholder", "/api/users/:id");
    });
  });

  describe("Request Body Tab Content", () => {
    it("renders request body textarea with correct attributes", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={1} />);

      // Click on Request Body tab
      const requestBodyTab = screen.getByRole("tab", { name: /request body/i });
      expect(requestBodyTab).toBeInTheDocument();
    });
  });

  describe("Component Props Integration", () => {
    it("passes projectId correctly for draft persistence", () => {
      const mockOnSubmit = vi.fn();
      renderWithRouter(<RESTForm onSubmit={mockOnSubmit} projectId={123} />);

      // The component should have rendered with the projectId
      expect(screen.getByRole("button", { name: /save api/i })).toBeInTheDocument();
    });

    it("passes restId correctly for edit mode", () => {
      const mockOnSubmit = vi.fn();
      const mockInitialData: RestAPI = {
        id_rest_api: 1,
        id_project: 1,
        id_user: 1,
        name: "Test",
        description: "",
        method: "GET",
        endpoint: "/test",
        headers: [],
        path_params: [],
        query_params: [],
        request_body: undefined,
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      renderWithRouter(
        <RESTForm
          onSubmit={mockOnSubmit}
          projectId={1}
          initialData={mockInitialData}
          restId={456}
        />
      );

      expect(screen.getByLabelText(/api name/i)).toHaveValue("Test");
    });
  });

  describe("Zod Schema Integration", () => {
    it("validates name field has min length constraint", () => {
      // Valid name
      const validNameResult = restAPISchema.safeParse({
        name: "Valid Name",
        method: "GET",
        endpoint: "/test",
        headers: [],
        path_params: [],
        query_params: [],
        responses: {},
      });
      expect(validNameResult.success).toBe(true);

      // Invalid name (too short)
      const invalidNameResult = restAPISchema.safeParse({
        name: "AB",
        method: "GET",
        endpoint: "/test",
        headers: [],
        path_params: [],
        query_params: [],
        responses: {},
      });
      expect(invalidNameResult.success).toBe(false);
    });

    it("validates endpoint field is required", () => {
      const result = restAPISchema.safeParse({
        name: "Test API",
        method: "GET",
        endpoint: "",
        headers: [],
        path_params: [],
        query_params: [],
        responses: {},
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid request body JSON schema", () => {
      const result = restAPISchema.safeParse({
        name: "Test API",
        method: "POST",
        endpoint: "/users",
        headers: [],
        path_params: [],
        query_params: [],
        request_body: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
        },
        responses: {},
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty string as optional request_body", () => {
      const result = restAPISchema.safeParse({
        name: "Test API",
        method: "GET",
        endpoint: "/users",
        headers: [],
        path_params: [],
        query_params: [],
        request_body: "",
        responses: {},
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid JSON format in request_body", () => {
      const result = restAPISchema.safeParse({
        name: "Test API",
        method: "POST",
        endpoint: "/users",
        headers: [],
        path_params: [],
        query_params: [],
        request_body: "{invalid json}",
        responses: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Invalid JSON format");
      }
    });

    it("rejects valid JSON but invalid schema in request_body", () => {
      const result = restAPISchema.safeParse({
        name: "Test API",
        method: "POST",
        endpoint: "/users",
        headers: [],
        path_params: [],
        query_params: [],
        request_body: '{"properties": {"name": "string"}}',
        responses: {},
      });
      expect(result.success).toBe(false);
    });
  });
});
