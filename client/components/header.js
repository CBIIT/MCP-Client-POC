import html from "solid-js/html";

export default function Header() {
  return html`
    <header class="flex-grow-0">
      <div class="bg-light">
        <div class="container">
          <div class="row">
            <div class="col d-flex align-items-center py-1">
              <img src="assets/images/icon-flag.svg" alt="U.S. Flag" width="16" class="me-1" />
              <small>An official website of the United States government</small>
            </div>
          </div>
        </div>
      </div>
      <div class="container d-none d-lg-flex flex-wrap justify-content-between align-items-center py-3">
        <a href="/" title="Home" class="d-inline-block">
          <object height="50" data="assets/images/logo.svg" alt="Logo" class="pe-none" />
        </a>
      </div>
    </header>
  `;
}
