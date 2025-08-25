import React from 'react';
import './BlogPage.css';

const BlogPage = () => {
  return (
    <div className="blog-page">
      <div className="page-header">
        <div className="container">
          <h1>South-West Sydney Investment & Living Guide</h1>
          <p>Discover why South-West Sydney is the smart choice for investors and families</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <article className="blog-content">
            <p className="lead-text">
              South-West Sydney has shifted from "future promise" to "active build." In 2025, the new 24-hour Western Sydney International (Nancy-Bird Walton) Airport wrapped up major construction and unveiled its terminal. The Metro line to the airport is underway, and Bradfield City Centre (the Aerotropolis CBD) is taking shape. Add upgraded hospitals, new schools, and fast-growing town centres like Ed.Square and Oran Park, and you've got a region where lifestyle and long-term job growth intersect.
            </p>

            <h2>The Big Picture: Growth Engines You Can Actually Point To</h2>
            
            <p><strong>1. A Brand-New 24-Hour Airport (Opening Target: Late 2026)</strong></p>
            <p><strong>What's Done:</strong> Runway and major construction are complete; the terminal has been formally unveiled. Airlines including Qantas/Jetstar and Singapore Airlines have announced commitments. Target: ~5M passengers in 2026 scaling toward 10M by 2031.</p>
            <p><strong>Why It Matters:</strong> 24/7 operations (no curfew) + a freight and jobs hub on a 1,700-hectare site—twice the size of Kingsford Smith—put the South-West on the world's map.</p>

            <p><strong>2. Metro to the Airport (Fast, Frequent, Driverless)</strong></p>
            <p>Sydney Metro – Western Sydney Airport line will connect St Marys to Bradfield City Centre via the airport, with six new stations and 12 new metro trains. Operations will be run for 15 years after opening. Translation: reliable, high-frequency rail baked into the region's DNA.</p>

            <p><strong>3. Bradfield City Centre (The Aerotropolis CBD)</strong></p>
            <p>NSW's "new global city" beside the airport—planned as a hub for advanced manufacturing, research, culture, and entertainment. Sector plans and first buildings are underway, anchoring long-run job creation in the South-West.</p>

            <h2>Suburb Spotlights: What's Already On The Ground</h2>
            
            <p><strong>Edmondson Park (Ed.Square)</strong></p>
            <p><strong>Lifestyle Now:</strong> A walkable town centre with shopping, dining, cinema, medical and fitness—right next to Edmondson Park station—has made Ed.Square a genuine "park-once, live-a-lot" community.</p>
            <p><strong>Momentum:</strong> Ongoing precinct updates, including station parking and town-centre progress through 2025.</p>

            <p><strong>Leppington & Austral</strong></p>
            <p><strong>Why They're Hot:</strong> Part of the South West Growth Area with rezoning and structure plans to deliver new homes close to jobs, parks, schools and services; Leppington Town Centre sits on existing rail with ~15 minutes to Liverpool CBD by train.</p>
            <p><strong>Active Approvals:</strong> New housing projects continue to be approved across Austral's growth corridor, signaling steady supply and infrastructure delivery.</p>

            <p><strong>Oran Park</strong></p>
            <p><strong>Town Centre + Employment Footprint:</strong> Plans outline a strong retail core and access to The Northern Road and Camden Valley Way—key arterials that keep daily life practical.</p>

            <h2>Daily Life: Hospitals, Schools, Jobs, Cafés, Hotels, Sport</h2>
            
            <p><strong>Hospitals:</strong> The Liverpool Health and Academic Precinct (Liverpool Hospital) moved into the next phase of its major redevelopment in April 2025—great for clinical services, research and local employment. Campbelltown and Camden continue to serve the corridor.</p>

            <p><strong>Schools:</strong> The South-West Growth Area planning framework bakes in new schools; even the Aerotropolis is attracting major education moves (e.g., a 1,200-student school relocating to the Western Sydney science precinct by 2029).</p>

            <p><strong>Jobs:</strong> Airport operations (passenger + freight), Metro operations/maintenance, and Bradfield City Centre industries are long-horizon employment drivers.</p>

            <p><strong>Cafés, Dining & Entertainment:</strong> Ed.Square has quickly become the region's lifestyle anchor; Oran Park Town Centre and Leppington's emerging retail add choice and convenience.</p>

            <p><strong>Hotels:</strong> Expect hotel and short-stay development to cluster around the airport/Bradfield as opening nears (typical of new international gateways). This trend aligns with the airport's passenger targets and 24/7 status.</p>

            <p><strong>Sport & Recreation:</strong> Master-planned communities (Ed.Square, Oran Park) integrate gyms, parks and fields; council plans across the SW Growth Area reserve land for open space and sport as populations scale.</p>

            <h2>Transport You Can Live With</h2>
            <p><strong>Today:</strong> Rail from Edmondson Park and Leppington, with road access via Camden Valley Way, The Northern Road and M7.</p>
            <p><strong>Coming:</strong> Metro to the airport and Bradfield City Centre, plus ongoing intersection and road upgrades (e.g., Rickard Rd–Ingleburn Rd near Leppington receiving new funding in 2029 pipeline).</p>

            <h2>What It Looked Like in 2023 vs Now (2025)</h2>
            <p><strong>2023:</strong> Airport earthworks and terminal build were mid-stream; Metro/WSP planning and early works were the talking points; Ed.Square and Oran Park town centres were maturing.</p>
            <p><strong>2025:</strong> Airport major construction complete; terminal unveiled (June 2025). Aerotropolis/Bradfield has opened its first building and published sector plans; Liverpool Hospital precinct is into its next redevelopment phase. The difference is tangible progress and fixed opening horizons.</p>

            <div className="blog-cta">
              <h3>Ready to Explore South-West Sydney?</h3>
              <p>Whether you're looking to invest, find your dream home, or simply want to learn more about this rapidly developing region, our team at AuzLandRE is here to help.</p>
              <div className="cta-buttons">
                <a href="/contact" className="btn btn-primary">Get in Touch</a>
                <a href="/buy" className="btn btn-secondary">View Properties</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
