export function Placeholders() {
  return (
    <section className="later span-2" aria-labelledby="later-heading">
      <div className="section-kicker">
        <h2 id="later-heading">Coming later</h2>
        <span className="stamp">Placeholder</span>
      </div>
      <p className="quiet">These cards are reserved. They are not connected to a data source in this version.</p>
      <div className="later-grid">
        <article className="placeholder-card">
          <span className="stamp">Placeholder</span>
          <h3>Strava</h3>
          <p>Runs and rides will land here: weekly distance, moving time, and how they sit beside lower-body days.</p>
        </article>
        <article className="placeholder-card">
          <span className="stamp">Placeholder</span>
          <h3>Body weight</h3>
          <p>Scale weight and body trends will land here once measurements are connected.</p>
        </article>
      </div>
    </section>
  );
}
