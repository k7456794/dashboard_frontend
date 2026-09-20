function StatCard({ title, value, change, icon}) {
    return (
        <div className="stat-card">
            {/* Icon helps users quickly understand what the statistic represents. */}

            <div className="stat-icon">{icon}</div>

            <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>

         {/* The change value shows how the statistic has changed. */}
        <span>{change}</span>
        </div>
        </div>
    );
}

export default StatCard;