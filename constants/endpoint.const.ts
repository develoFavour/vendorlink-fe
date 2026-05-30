export const BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:5000/api/v1";

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		LOGOUT: "/auth/logout",
		ME: "/auth/me",
		REFRESH: "/auth/refresh",
		REGISTER_BUYER: "/auth/register/buyer",
		REGISTER_VENDOR: "/auth/register/vendor",
		VERIFY_EMAIL: "/auth/verify-email",
	},
	VENDORS: {
		GET_ALL: "/vendors",
		GET_ONE: (id: string) => `/vendors/${id}`,
	},
	PRODUCTS: {
		GET_PUBLIC: "/products/public",
		GET_PUBLIC_ONE: (id: string) => `/products/public/${id}`,
		GET_ALL: "/products",
		GET_ONE: (id: string) => `/products/${id}`,
		CREATE: "/products",
		UPDATE: (id: string) => `/products/${id}`,
		DELETE: (id: string) => `/products/${id}`,
	},
	WISHLIST: {
		GET: "/wishlist",
		ADD: (productId: string) => `/wishlist/${productId}`,
		REMOVE: (productId: string) => `/wishlist/${productId}`,
	},
	CART: {
		GET: "/cart",
		CLEAR: "/cart",
		ADD_ITEM: (productId: string) => `/cart/items/${productId}`,
		UPDATE_ITEM: (productId: string) => `/cart/items/${productId}`,
		REMOVE_ITEM: (productId: string) => `/cart/items/${productId}`,
	},
	ORDERS: {
		GET_ALL: "/orders",
		GET_ONE: (id: string) => `/orders/${id}`,
		CHECKOUT: "/orders/checkout",
		VERIFY_PAYSTACK: (reference: string) =>
			`/orders/paystack/verify/${reference}`,
		CANCEL: (id: string) => `/orders/${id}/cancel`,
		REQUEST_REFUND: (id: string) => `/orders/${id}/refund-requests`,
		GET_ADMIN: "/orders/admin",
		GET_SELLER: "/orders/seller",
		GET_SELLER_ONE: (id: string) => `/orders/seller/${id}`,
		UPDATE_SELLER_STATUS: (id: string) => `/orders/seller/${id}/status`,
	},
	CONVERSATIONS: {
		START: "/conversations/start",
		GET_ALL: "/conversations",
		GET_MESSAGES: (id: string) => `/conversations/${id}/messages`,
		SEND_MESSAGE: (id: string) => `/conversations/${id}/messages`,
		MARK_READ: (id: string) => `/conversations/${id}/read`,
	},
	DASHBOARD: {
		ADMIN_OVERVIEW: "/dashboard/admin/overview",
		SELLER_OVERVIEW: "/dashboard/seller/overview",
	},
	REVIEWS: {
		GET_ADMIN: "/reviews/admin",
		HIDE_ADMIN: (reviewId: string) => `/reviews/admin/${reviewId}/hide`,
		RESTORE_ADMIN: (reviewId: string) => `/reviews/admin/${reviewId}/restore`,
		DELETE_ADMIN: (reviewId: string) => `/reviews/admin/${reviewId}`,
		GET_PRODUCT: (productId: string) => `/reviews/products/${productId}`,
		GET_ELIGIBILITY: (productId: string) =>
			`/reviews/products/${productId}/eligibility`,
		CREATE: (productId: string) => `/reviews/products/${productId}`,
		UPDATE_MY: (productId: string) => `/reviews/products/${productId}/me`,
		DELETE_MY: (productId: string) => `/reviews/products/${productId}/me`,
		GET_SELLER: "/reviews/seller",
	},
	ADMIN: {
		GET_USERS: "/admin/users",
		UPDATE_USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
		GET_VENDORS: "/admin/vendors",
		UPDATE_VENDOR_STATUS: (storeId: string) =>
			`/admin/vendors/${storeId}/status`,
	},
	EARNINGS: {
		SELLER_OVERVIEW: "/earnings/seller/overview",
		SELLER_LIST: "/earnings/seller",
		REQUEST_WITHDRAWAL: "/earnings/seller/withdrawals",
		ADMIN_SUMMARY: "/earnings/admin/summary",
		ADMIN_WITHDRAWALS: "/earnings/admin/withdrawals",
		APPROVE_WITHDRAWAL: (id: string) =>
			`/earnings/admin/withdrawals/${id}/approve`,
		REJECT_WITHDRAWAL: (id: string) =>
			`/earnings/admin/withdrawals/${id}/reject`,
		PROCESS_WITHDRAWAL: (id: string) =>
			`/earnings/admin/withdrawals/${id}/process`,
		CONFIRM_WITHDRAWAL_PAID: (id: string) =>
			`/earnings/admin/withdrawals/${id}/confirm-paid`,
	},
	// Add more endpoints as needed
};
