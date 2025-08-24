export default function Header(props) {
    return (
        <h1 className={`text-8xl font-bold ${props.className}`}>{props.bodyText}</h1>
    );
}