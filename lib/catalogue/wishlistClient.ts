/** Browser client for `/api/catalogue/wishlist/[id]` (session cookie is sent automatically). */

export async function setArchetypeWishlisted(archetypeId: string, wishlisted: boolean): Promise<void> {
  const response = await fetch(`/api/catalogue/wishlist/${archetypeId}`, {
    method: wishlisted ? "PUT" : "DELETE",
    credentials: "same-origin",
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) {
    throw new WishlistAuthError(typeof result.reason === "string" ? result.reason : "Sign in to use your wishlist.");
  }
  if (!response.ok || result.error) {
    throw new Error(typeof result.reason === "string" ? result.reason : "Unable to update wishlist.");
  }
}

export class WishlistAuthError extends Error {
  readonly code = "auth" as const;
}
