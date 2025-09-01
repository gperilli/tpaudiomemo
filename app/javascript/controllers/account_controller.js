import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    const accountForms = document.querySelectorAll(".account-forms");
    accountForms.forEach((accountForm) => {
      accountForm.addEventListener("submit", function (e) {
        e.preventDefault();
      });
    });
  }

  profilemodal() {
    document.body.style.overflowY = "hidden";

    document.querySelector("#ui-underlay").style.display = "block";
    document
      .querySelector("#modalcontainer")
      .classList.add("show-modal-container");
    document.querySelector("#profilemodal").classList.add("show-modal");
  }

  submitProfileUpdate() {
    const name = document.querySelector("#name").value;
    // const schoolName = document.querySelector('#school_name').value;
    // const graduationYear = document.querySelector('#graduation_year').value;

    fetch(`/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
      },
      body: JSON.stringify({
        user: {
          name: name,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  emailmodal() {
    document.body.style.overflowY = "hidden";

    document.querySelector("#ui-underlay").style.display = "block";
    document
      .querySelector("#modalcontainer")
      .classList.add("show-modal-container");
    document.querySelector("#emailmodal").classList.add("show-modal");
  }

  passwordmodal() {
    document.body.style.overflowY = "hidden";

    document.querySelector("#ui-underlay").style.display = "block";
    document
      .querySelector("#modalcontainer")
      .classList.add("show-modal-container");
    document.querySelector("#passwordmodal").classList.add("show-modal");
  }

  submitPasswordUpdate() {
    const currentPassword = document.querySelector("#old_password").value;
    const newPassword = document.querySelector("#new_password").value;
    const confirmPassword = document.querySelector("#confirm_password").value;

    fetch(`/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
      },
      body: JSON.stringify({
        user: {
          password: newPassword,
          password_confirmation: confirmPassword,
          current_password: currentPassword,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json();
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
      });
  }

  submitChangeEmail() {
    const newEmail = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch(`/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
      },
      body: JSON.stringify({
        user: {
          email: newEmail,
          current_password: password,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json();
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
      });
  }

  resetmodal() {
    document.body.style.overflowY = "hidden";

    document.querySelector("#ui-underlay").style.display = "block";
    document
      .querySelector("#modalcontainer")
      .classList.add("show-modal-container");
    document.querySelector("#resetmodal").classList.add("show-modal");
  }

  submitAccountReset() {
    fetch(`/memos/destroy_all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this.closemodal();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  closemodal() {
    document.body.style.overflowY = "visible";

    document.querySelector("#ui-underlay").style.display = "none";
    document
      .querySelector("#modalcontainer")
      .classList.remove("show-modal-container");
    document.querySelector("#emailmodal").classList.remove("show-modal");
    document.querySelector("#passwordmodal").classList.remove("show-modal");
    document.querySelector("#profilemodal").classList.remove("show-modal");
    document.querySelector("#resetmodal").classList.remove("show-modal");
  }
}
