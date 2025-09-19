type WrapperProps = {
	wrapper: (children: React.ReactNode) => React.ReactNode;
	condition: boolean;
	children: React.ReactNode;
};

export function ConditionalWrapper({
	wrapper,
	condition,
	children,
}: WrapperProps) {
	return condition ? wrapper(children) : children;
}
