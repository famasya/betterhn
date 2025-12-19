import DomPurify from "isomorphic-dompurify";

type CommentContentProps = {
	text: string | null;
	deleted?: boolean;
};

export function CommentContent({ text, deleted }: CommentContentProps) {
	return (
		<div
			className="comment-item"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
			dangerouslySetInnerHTML={{
				__html: DomPurify.sanitize(deleted ? "Deleted" : text || "", {
					USE_PROFILES: { html: true },
					ADD_ATTR: ["target"],
					ALLOWED_ATTR: ["href", "target", "rel"],
				}),
			}}
		/>
	);
}
