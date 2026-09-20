function ChartCard ({title, children, className = ""}) {

    return (
        <div className={`chart-card ${className}`.trim()}>
            {/* The title tells the user what information the chart represents. */}
            <h3>{title}</h3>

            {/* children allows us to reuse this card with different charts. */}
            <div className="chart-container">
                {children}
            </div>
        </div>
    );
}
export default ChartCard;