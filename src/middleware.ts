export { default } from "next-auth/middleware"

export const config = { matcher: ["/mypage/:path*", "/sell", "/purchase/:path*", "/transaction/:path*"] }
