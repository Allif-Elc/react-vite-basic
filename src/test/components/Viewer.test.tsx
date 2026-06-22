import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Viewer from "../../pages/Viewer";

// Mock the fetchPublicAPIs function
const mockFetchPublicAPIs = vi.fn();
vi.mock("../../services/apiService", () => ({
	fetchPublicAPIs: mockFetchPublicAPIs,
}));

// Mock useParams
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => ({
	...await vi.importActual<object>("react-router-dom"),
	useParams: () => mockUseParams(),
}));

const renderWithRouter = (component: React.ReactNode) => {
	return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Viewer", () => {
	const mockSlug = "test-project";

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseParams.mockReturnValue({ slug: mockSlug });
	});

	it("shows loading state initially", () => {
		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: [],
			graphql: [],
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		expect(screen.getByText(/loading documentation/i)).toBeInTheDocument();
	});

	it("shows error state when API fails", async () => {
		mockFetchPublicAPIs.mockRejectedValue(new Error("Failed to load"));

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText(/failed to load documentation/i)).toBeInTheDocument();
		});
	});

	it("shows empty state when all API lists are empty", async () => {
		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: [],
			graphql: [],
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText(/no rest apis/i)).toBeInTheDocument();
		});
	});

	it("displays project name when loaded", async () => {
		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project", description: "A test project" },
			rest: [],
			graphql: [],
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText("Test Project")).toBeInTheDocument();
			expect(screen.getByText("A test project")).toBeInTheDocument();
		});
	});

	it("auto-selects first REST API on load", async () => {
		const restAPIs = [
			{ id_rest_api: 1, name: "GET /api/users", method: "GET", endpoint: "/api/users" },
			{ id_rest_api: 2, name: "POST /api/users", method: "POST", endpoint: "/api/users" },
		];

		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: restAPIs,
			graphql: [],
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			// Verify the first REST API is highlighted (selected)
			expect(screen.getByText("GET /api/users")).toBeInTheDocument();
		});
	});

	it("auto-selects first GraphQL API when REST is empty", async () => {
		const graphqlAPIs = [
			{ id_graphql_api: 1, name: "getUser", type: "query", return_type: "User" },
		];

		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: [],
			graphql: graphqlAPIs,
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText("getUser")).toBeInTheDocument();
		});
	});

	it("auto-selects first gRPC API when others are empty", async () => {
		const grpcAPIs = [
			{ id_grpc_api: 1, service_name: "UserService", method_name: "GetUser" },
		];

		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: [],
			graphql: [],
			grpc: grpcAPIs,
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText("GetUser")).toBeInTheDocument();
		});
	});

	it("auto-selects first API when switching to non-empty tab", async () => {
		const restAPIs = [
			{ id_rest_api: 1, name: "GET /api/users", method: "GET", endpoint: "/api/users" },
		];
		const graphqlAPIs = [
			{ id_graphql_api: 1, name: "getUser", type: "query", return_type: "User" },
		];

		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: restAPIs,
			graphql: graphqlAPIs,
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			expect(screen.getByText("GET /api/users")).toBeInTheDocument();
		});

		// Click on GraphQL tab
		const graphqlTab = screen.getByText("graphql");
		graphqlTab.click();

		await waitFor(() => {
			expect(screen.getByText("getUser")).toBeInTheDocument();
		});
	});

	it("highlights selected API correctly", async () => {
		const restAPIs = [
			{ id_rest_api: 1, name: "GET /api/users", method: "GET", endpoint: "/api/users" },
			{ id_rest_api: 2, name: "POST /api/users", method: "POST", endpoint: "/api/users" },
		];

		mockFetchPublicAPIs.mockResolvedValue({
			project: { id: 1, name: "Test Project", slug: "test-project" },
			rest: restAPIs,
			graphql: [],
			grpc: [],
		});

		renderWithRouter(<Viewer />);

		await waitFor(() => {
			// Click on second API
			const secondAPI = screen.getByText("POST /api/users");
			secondAPI.click();
		});

		await waitFor(() => {
			// Verify the selected API is highlighted
			const selectedButton = screen.getByText("POST /api/users").closest("button");
			expect(selectedButton).toHaveClass(/bg-primary\\/10/);
		});
	});
});
