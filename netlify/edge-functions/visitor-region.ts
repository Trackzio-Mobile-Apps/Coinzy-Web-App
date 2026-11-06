interface GeoContext {
  geo?: { country?: { code?: string } };
}

export default (_request: Request, context: GeoContext) => {
  const country = context.geo?.country?.code?.toUpperCase();
  const region = !country || !/^[A-Z]{2}$/.test(country) || country === "XX"
    ? "unknown"
    : country === "IN" ? "india" : "rest-of-world";

  return Response.json({ region }, {
    headers: { "Cache-Control": "no-store" },
  });
};

export const config = { path: "/api/visitor-region" };
