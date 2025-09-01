import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    const elements = document.querySelectorAll(".animate-on-scroll");

    function checkVisibility() {
      const windowHeight = window.innerHeight;
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < windowHeight - 100) {
          element.classList.add("visible");
        }
      });
    }

    window.addEventListener("scroll", checkVisibility);
    window.addEventListener("load", checkVisibility); // Initial check
  }
}
