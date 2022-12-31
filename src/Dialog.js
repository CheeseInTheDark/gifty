export default function Dialog({ children, onBackgroundClick }) {
    return <div className="dialog-background" onClick={onBackgroundClick}>
        <div className="dialog">
            {children}
        </div>
    </div>
}