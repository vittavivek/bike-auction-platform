import { useEffect, useState } from "react";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";



function App() {

  const [auctions, setAuctions] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  const [token, setToken] = useState("");

  const [showLogin, setShowLogin] = useState(false);

  const [authMode, setAuthMode] = useState("login");

  const [registerName, setRegisterName] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");

  const [registerPassword, setRegisterPassword] = useState("");

  const [registerError, setRegisterError] = useState("");

  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");

  const [loginError, setLoginError] = useState("");

  const [loginMessage, setLoginMessage] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);



  const [selectedAuction, setSelectedAuction] = useState(null);

  const [bidAmount, setBidAmount] = useState("");

   const [bidLoading, setBidLoading] = useState(false);

  const [bidError, setBidError] = useState("");

  const [bidMessage, setBidMessage] = useState("");



 async function fetchAuctions() {

  try {

    setError("");

    const response = await fetch(`${API_URL}/auctions`);

    if (!response.ok) throw new Error("Unable to load auctions.");

    const data = await response.json();

    setAuctions(data);

  } catch {

    setError("Could not connect to the auction server. Please try again.");

  } finally {

    setLoading(false);

  }

}

  useEffect(() => {

    fetchAuctions();

  }, []);



  const filteredAuctions = auctions.filter((auction) =>

    `${auction.title} ${auction.make} ${auction.model}`

      .toLowerCase()

      .includes(search.toLowerCase())

  );



  const formatPrice = (price) =>

    new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: "INR",

      maximumFractionDigits: 2,

    }).format(Number(price));



  async function handleLogin(event) {

    event.preventDefault();

    setLoginError("");

    setLoginMessage("");

    setLoginLoading(true);



    try {

      const formData = new URLSearchParams();

      formData.append("username", loginEmail.trim());

      formData.append("password", loginPassword);



      const response = await fetch(`${API_URL}/login`, {

        method: "POST",

        headers: { "Content-Type": "application/x-www-form-urlencoded" },

        body: formData.toString(),

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Login failed.");



      setToken(data.access_token);

      setLoginPassword("");

      setShowLogin(false);

      setLoginMessage("Logged in successfully.");

    } catch (err) {

      setLoginError(err.message || "Unable to log in. Please try again.");

    } finally {

      setLoginLoading(false);

    }

  }



  async function handleRegister(event) {

    event.preventDefault();

    setRegisterError("");

    setLoginMessage("");

    setRegisterLoading(true);



    try {

      const response = await fetch(`${API_URL}/register`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          full_name: registerName.trim(),

          email: registerEmail.trim(),

          password: registerPassword,

        }),

      });

      const data = await response.json();



      if (!response.ok) {

        const detail = data.detail;

        const message = Array.isArray(detail)

          ? detail.map((item) => item.msg).join(", ")

          : detail;

        throw new Error(message || "Registration failed.");

      }



      setLoginEmail(registerEmail.trim());

      setLoginPassword("");

      setRegisterPassword("");

      setRegisterName("");

      setAuthMode("login");

      setLoginError("");

      setRegisterError("");

      setShowLogin(true);

      setLoginMessage("Account created successfully. Please log in.");

    } catch (err) {

      setRegisterError(

        err.message || "Unable to create your account. Please try again."

      );

    } finally {

      setRegisterLoading(false);

    }

  }



  function openAuction(auction) {

    setSelectedAuction(auction);

    setBidAmount(

      (

        Number(auction.current_price) + Number(auction.minimum_increment)

      ).toString()

    );

    setBidError("");

    setBidMessage("");

  }



  async function handleBid(event) {

    event.preventDefault();

    setBidError("");

    setBidMessage("");



    if (!token) {

      setSelectedAuction(null);

      setAuthMode("login");

      setShowLogin(true);

      setLoginMessage("Please log in before placing a bid.");

      return;

    }



    const amount = Number(bidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {

      setBidError("Enter a valid bid amount.");

      return;

    }



    setBidLoading(true);

    try {

      const response = await fetch(

        `${API_URL}/auctions/${selectedAuction.id}/bids`,

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,

          },

          body: JSON.stringify({ amount }),

        }

      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Unable to place your bid.");



      setBidMessage("Your bid was placed successfully.");

      await fetchAuctions();

      setSelectedAuction((current) =>

        current ? { ...current, current_price: data.current_price } : null

      );

      setBidAmount(

        (

          Number(data.current_price) +

          Number(selectedAuction.minimum_increment)

        ).toString()

      );

    } catch (err) {

      setBidError(err.message || "Unable to place your bid.");

    } finally {

      setBidLoading(false);

    }

  }



  function handleLogout() {

    setToken("");

    setLoginMessage("You have been logged out.");

    setSelectedAuction(null);

  }



  function openLogin() {

    setAuthMode("login");

    setLoginError("");

    setRegisterError("");

    setShowLogin(true);

  }



  return (

    <div className="app">

      <header className="navbar">

        <a className="brand" href="#" aria-label="MotoBid home">

          <span className="brand-icon">B</span>

          MotoBid

        </a>



        <nav>

          <a href="#auctions">Auctions</a>

          <a href="#how-it-works">How it works</a>

        </nav>



        <div className="nav-actions">

          {token ? (

            <button className="btn btn-outline" onClick={handleLogout}>

              Log out

            </button>

          ) : (

            <button className="btn btn-outline" onClick={openLogin}>

              Log in

            </button>

          )}

          <a className="btn btn-primary" href="#auctions">

            Explore

          </a>

        </div>

      </header>



      {loginMessage && (

        <div className="notice" role="status">

          {loginMessage}

          <button onClick={() => setLoginMessage("")} aria-label="Dismiss">

            ×

          </button>

        </div>

      )}



      <main>

        <section className="hero">

          <span className="eyebrow">THE NEXT RIDE STARTS HERE</span>

          <h1>

            Find your ride.

            <br />

            <span>Win your bid.</span>

          </h1>

          <p>

            Discover motorcycles you love and compete for your next ride

            through a transparent bidding experience.

          </p>



          <div className="hero-actions">

            <a className="btn btn-primary" href="#auctions">

              Explore auctions →

            </a>

            <a className="btn btn-outline" href="#how-it-works">

              How it works

            </a>

          </div>



          <div className="hero-stats">

            <div>

              <strong>{auctions.length}</strong>

              <span>Auctions listed</span>

            </div>

            <div>

              <strong>Secure</strong>

              <span>Bidding</span>

            </div>

            <div>

              <strong>Live</strong>

              <span>Price validation</span>

            </div>

          </div>

        </section>



        <section className="auctions" id="auctions">

          <div className="section-heading">

            <div>

              <span className="eyebrow">YOUR NEXT MOTORCYCLE</span>

              <h2>Explore auctions</h2>

              <p>Find a motorcycle worth riding home.</p>

            </div>

            <input

              type="search"

              placeholder="Search make or model..."

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              aria-label="Search auctions"

            />

          </div>



          {loading && <p>Loading auctions...</p>}



          {!loading && error && (

            <div className="empty-state">

              <h3>Unable to load auctions</h3>

              <p>{error}</p>

              <button className="btn btn-primary" onClick={fetchAuctions}>

                Try again

              </button>

            </div>

          )}



          {!loading && !error && filteredAuctions.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">⌕</div>

              <h3>

                {auctions.length === 0

                  ? "No auctions available"

                  : "No matching motorcycles"}

              </h3>

              <p>

                {auctions.length === 0

                  ? "Check back when new motorcycle auctions are listed."

                  : "Try searching with another make or model."}

              </p>

            </div>

          )}



          {!loading && !error && filteredAuctions.length > 0 && (

            <div className="auction-grid">

              {filteredAuctions.map((auction) => (

                <article className="auction-card" key={auction.id}>

                  <div className="bike-visual">

                    <span className="bike-symbol">🏍️</span>

                    <span className={`status status-${auction.status}`}>

                      {auction.status}

                    </span>

                  </div>



                  <div className="auction-card-content">

                    <span className="eyebrow">

                      {auction.make} · {auction.year}

                    </span>

                    <h3>{auction.title}</h3>

                    <p className="bike-model">{auction.model}</p>



                    <div className="price-row">

                      <div>

                        <span className="price-label">Current price</span>

                        <strong>{formatPrice(auction.current_price)}</strong>

                      </div>

                      <div className="increment">

                        <span className="price-label">Min. increment</span>

                        <strong>{formatPrice(auction.minimum_increment)}</strong>

                      </div>

                    </div>



                    <p className="auction-description">{auction.description}</p>

                    <button

                      className="btn btn-primary bid-button"

                      onClick={() => openAuction(auction)}

                    >

                      View auction →

                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>



        <section className="how-it-works" id="how-it-works">

          <span className="eyebrow">SIMPLE. TRANSPARENT. SECURE.</span>

          <h2>Three steps to your next ride</h2>

          <div className="steps">

            <article>

              <span>01</span>

              <h3>Discover</h3>

              <p>Browse available motorcycle auctions.</p>

            </article>

            <article>

              <span>02</span>

              <h3>Place a bid</h3>

              <p>Compete with valid bids and clear increments.</p>

            </article>

            <article>

              <span>03</span>

              <h3>Win your ride</h3>

              <p>Track the auction and its final price.</p>

            </article>

          </div>

        </section>

      </main>



      <footer>

        <a className="brand" href="#">

          <span className="brand-icon">B</span>

          MotoBid

        </a>

        <p>Built for riders. Powered by fair bidding.</p>

      </footer>



      {showLogin && (

        <div

          className="modal-backdrop"

          onClick={(event) => {

            if (event.target === event.currentTarget) setShowLogin(false);

          }}

        >

          <section

            className="auth-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="login-title"

          >

            <button

              className="modal-close"

              onClick={() => setShowLogin(false)}

              aria-label="Close authentication"

            >

              ×

            </button>



            <span className="eyebrow">

              {authMode === "login" ? "WELCOME BACK" : "JOIN MOTOBID"}

            </span>

            <h2 id="login-title">

              {authMode === "login"

                ? "Log in to MotoBid"

                : "Create your account"}

            </h2>

            <p>

              {authMode === "login"

                ? "Sign in to participate in motorcycle auctions."

                : "Join MotoBid and discover your next motorcycle."}

            </p>



            {authMode === "login" ? (

              <form onSubmit={handleLogin} className="auth-form">

                <label htmlFor="login-email">Email address</label>

                <input

                  id="login-email"

                  type="email"

                  autoComplete="username"

                  placeholder="you\@example.com"

                  value={loginEmail}

                  onChange={(event) => setLoginEmail(event.target.value)}

                  required

                />



                <label htmlFor="login-password">Password</label>

                <input

                  id="login-password"

                  type="password"

                  autoComplete="current-password"

                  placeholder="Enter your password"

                  value={loginPassword}

                  onChange={(event) => setLoginPassword(event.target.value)}

                  required

                />



                {loginError && (

                  <p className="form-error" role="alert">{loginError}</p>

                )}



                <button

                  className="btn btn-primary auth-submit"

                  type="submit"

                  disabled={loginLoading}

                >

                  {loginLoading ? "Logging in..." : "Log in"}

                </button>

              </form>

            ) : (

              <form onSubmit={handleRegister} className="auth-form">

                <label htmlFor="register-name">Full name</label>

                <input

                  id="register-name"

                  type="text"

                  autoComplete="name"

                  placeholder="Enter your full name"

                  value={registerName}

                  onChange={(event) => setRegisterName(event.target.value)}

                  minLength={2}

                  maxLength={120}

                  required

                />



                <label htmlFor="register-email">Email address</label>

                <input

                  id="register-email"

                  type="email"

                  autoComplete="email"

                  placeholder="you\@example.com"

                  value={registerEmail}

                  onChange={(event) => setRegisterEmail(event.target.value)}

                  required

                />



                <label htmlFor="register-password">Password</label>

                <input

                  id="register-password"

                  type="password"

                  autoComplete="new-password"

                  placeholder="At least 8 characters"

                  value={registerPassword}

                  onChange={(event) => setRegisterPassword(event.target.value)}

                  minLength={8}

                  maxLength={128}

                  required

                />



                {registerError && (

                  <p className="form-error" role="alert">{registerError}</p>

                )}



                <button

                  className="btn btn-primary auth-submit"

                  type="submit"

                  disabled={registerLoading}

                >

                  {registerLoading ? "Creating account..." : "Create account"}

                </button>

              </form>

            )}



            <p className="auth-note">

              {authMode === "login"

                ? "Don't have an account?"

                : "Already have an account?"}{" "}

              <button

                type="button"

                className="auth-toggle"

                onClick={() => {

                  setAuthMode((current) =>

                    current === "login" ? "register" : "login"

                  );

                  setLoginError("");

                  setRegisterError("");

                  setLoginPassword("");

                  setRegisterPassword("");

                  setLoginMessage("");

                }}

              >

                {authMode === "login" ? "Create account" : "Log in"}

              </button>

            </p>

          </section>

        </div>

      )}



      {selectedAuction && (

        <div

          className="modal-backdrop"

          onClick={(event) => {

            if (event.target === event.currentTarget) setSelectedAuction(null);

          }}

        >

          <section

            className="auth-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="auction-title"

          >

            <button

              className="modal-close"

              onClick={() => setSelectedAuction(null)}

              aria-label="Close auction"

            >

              ×

            </button>



            <span className="eyebrow">

              {selectedAuction.make} · {selectedAuction.year}

            </span>

            <h2 id="auction-title">{selectedAuction.title}</h2>

            <p>{selectedAuction.description}</p>



            <div className="modal-price">

              <span className="price-label">Current price</span>

              <strong>{formatPrice(selectedAuction.current_price)}</strong>

            </div>

            <div className="modal-price">

              <span className="price-label">Minimum next bid</span>

              <strong>

                {formatPrice(

                  Number(selectedAuction.current_price) +

                    Number(selectedAuction.minimum_increment)

                )}

              </strong>

            </div>



            {selectedAuction.status === "live" ? (

              <form onSubmit={handleBid} className="auth-form">

                <label htmlFor="bid-amount">Your bid (INR)</label>

                <input

                  id="bid-amount"

                  type="number"

                  min={

                    Number(selectedAuction.current_price) +

                    Number(selectedAuction.minimum_increment)

                  }

                  step="0.01"

                  value={bidAmount}

                  onChange={(event) => setBidAmount(event.target.value)}

                  required

                />



                {bidError && (

                  <p className="form-error" role="alert">{bidError}</p>

                )}

                {bidMessage && (

                  <p className="form-success" role="status">{bidMessage}</p>

                )}



                <button

                  className="btn btn-primary auth-submit"

                  type="submit"

                  disabled={bidLoading}

                >

                  {bidLoading ? "Placing bid..." : "Place bid"}

                </button>

              </form>

            ) : (

              <p>This auction is not currently accepting bids.</p>

            )}



            {!token && (

              <p className="auth-note">

                You must log in before placing a bid.

              </p>

            )}

          </section>

        </div>

      )}

    </div>

  );

}



export default App;
