import { useState, useEffect } from "react";
import { MDBBtn } from 'mdb-react-ui-kit';

const CVE = () => {
  const [cveData, setCveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const itemsPerPage = 8;

  const getInitialDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 119); // 119 days to ensure it's fully within 120 limit
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    };
  };

  useEffect(() => {
    const fetchCVEs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch up to 100 results so we can paginate locally for speed
        let url = "/rest/json/cves/2.0?resultsPerPage=2000";
        
        if (activeSearch && activeSearch.toLowerCase().match(/^cve-\d{4}-\d{4,}$/)) {
            url += `&cveId=${activeSearch}`;
        } else {
            if (activeSearch) url += `&keywordSearch=${encodeURIComponent(activeSearch)}`;
            // Always fetch based on the trailing 120 days window to ensure recent Intel
            // const dates = getInitialDates();
            // url += `&pubStartDate=${dates.start}T00:00:00.000`;
            // url += `&pubEndDate=${dates.end}T23:59:59.999`;
        }

        // Prepare headers. If an API key is available in the environment, attach it for higher rate limits.
        const options = {
          method: 'GET',
          headers: {}
        };
        
        const apiKey = process.env.REACT_APP_NVD_API_KEY;
        if (apiKey && apiKey !== "your_copied_api_key_goes_here") {
          options.headers["apiKey"] = apiKey;
        }

        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Failed to fetch CVE data. The NVD API may be rate limiting you.");
        const data = await response.json();
        
        // Sort the data received in descending order manually so the newest are first
        const sortedData = (data.vulnerabilities || []).sort((a,b) => {
            return new Date(b.cve.published) - new Date(a.cve.published);
        });
        
        setCveData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCVEs();
  }, [activeSearch]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setActiveSearch(searchInput.trim());
    setCurrentPage(1); // Reset to first page of the new payload
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cveData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(cveData.length / itemsPerPage);

  const getSeverity = (score) => {
    if (!score) return { label: "N/A", color: "#6c757d" };
    if (score >= 9) return { label: "CRITICAL", color: "#ff4d4f" };
    if (score >= 7) return { label: "HIGH", color: "#ff8800" };
    if (score >= 4) return { label: "MEDIUM", color: "#3fa9f5" };
    return { label: "LOW", color: "#2ecc71" };
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="text-center mb-4">
          Latest CVEs from NVD (National Vulnerability Database)
        </h1>
      <div className="container">
        <div
          className="mt-4 mb-5 mx-auto p-4 rounded shadow"
          style={{ width: "100%", maxWidth: "1400px", backgroundColor: "#1e1e2f" }}
        >

          {/* Search Bar */}
          <div className="mb-4 d-flex justify-content-center">
            <form onSubmit={handleSearchSubmit} className="d-flex" style={{ width: "100%", maxWidth: "600px" }}>
              <input
                type="text"
                className="form-control me-2"
                placeholder="Search NVD database by CVE ID or keyword..."
                value={searchInput}
                onChange={handleSearchChange}
                style={{ backgroundColor: "#2b2b3c", color: "white", border: "1px solid #4d4d5b" }}
              />
              <MDBBtn type="submit" className="shadow-0" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </MDBBtn>
            </form>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="text-center text-white my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Querying NVD Database...</p>
            </div>
          )}

          {!loading && !error && cveData.length === 0 && (
            <div className="text-center text-white my-5">
              <p>No CVEs found matching your search. Try broadening your keywords.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && cveData.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mb-3">
              <MDBBtn
                color="light" size="sm" className="me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </MDBBtn>

              <span className="text-white small">
                Page {currentPage} of {totalPages || 1}
              </span>

              <MDBBtn
                color="light" size="sm" className="ms-2"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </MDBBtn>
            </div>
          )}

          <div className="row">
            {!loading && !error && currentItems.map((item) => {
              const cve = item.cve;

              const score =
                cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
                cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
                cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore;

              const severity = getSeverity(score);

              return (
                <div className="col-md-6 col-lg-3 mb-3" key={cve.id}>
                  <div
                    className="card h-100 border-0 cve-card"
                    style={{
                      backgroundColor: "#2b2b3c",
                      color: "#e6e6e6",
                      cursor: "default"
                    }}
                  >
                    {/* CVE Header */}
                    <div
                      style={{
                        backgroundColor: "#12121a",
                        textAlign: "center",
                        padding: "4px",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {cve.id}
                    </div>

                    <div className="card-body p-3 d-flex flex-column">

                      {/* Severity */}
                      <div>
                        <span
                          style={{
                            backgroundColor: severity.color,
                            fontSize: "0.7rem",
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold"
                          }}
                        >
                          {severity.label} {score ? `(${score})` : ""}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "0.8rem",
                          marginTop: "10px",
                          marginBottom: "15px"
                        }}
                      >
                        {cve.descriptions[0]?.value}
                      </p>

                      {/* NVD Link anchored to bottom */}
                      <div className="mt-auto">
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.85rem",
                            color: "#7aa2ff",
                            textDecoration: "none",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          View on NVD →
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CVE;
