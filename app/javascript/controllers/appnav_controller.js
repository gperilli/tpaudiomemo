import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  hamburger;
  navMenu;
  mobNavStat;
  navMenuUnderlay;

  connect() {
    console.log("appnav controller");

    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.app-nav-side');
    this.navMenuUnderlay = document.querySelector('#ui-underlay');
    this.mobNavStat = 0;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }

  toggleDropdown() {
    console.log('toggleDropdown');

    document.querySelector('#app-nav-upper-dropdown').classList.toggle('dropdown-hide');
  }

  mobileMenu() {
    console.log('mobileMenu')

    if (this.mobNavStat == 0) {
      this.hamburger.classList.toggle('active');
      
      this.navMenu.classList.toggle('active');
      this.navMenuUnderlay.style.display = 'block';
      // document.querySelector('body').style.position = 'sticky';
      // document.querySelector('body').style.overflow = 'hidden';
      this.mobNavStat = 1;
    } else {
      // document.querySelector('body').style.position = 'relative';
      // document.querySelector('body').style.overflow = 'scroll';
      this.hamburger.classList.remove('active');
      
      this.navMenu.classList.remove('active');
      this.navMenuUnderlay.style.display = 'none';
      this.mobNavStat = 0;
    }
  }
}
