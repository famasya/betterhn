import type { ReactNode } from "react";

type WrapperProps = {
	wrapper: (children: ReactNode) => ReactNode;
	condition: boolean;
	children: ReactNode;
};

export function ConditionalWrapper({
	wrapper,
	condition,
	children,
}: WrapperProps) {
	return condition ? wrapper(children) : children;
}
