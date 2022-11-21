/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value : localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
         type: "Employee",
        })
      );
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId("icon-mail")
      expect(mailIcon).toHaveClass("active-icon")
    });

    describe("When a file is selected through fil input", () => {
      test("Then the selection of an image in the right format should work", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const employeeNewBillSubmit = new NewBill({ 
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        jest.spyOn(window, "alert").mockImplementation(() => {})
        const fileInput = screen.getByTestId("file")

        const handleChangeFile = jest.fn(employeeNewBillSubmit.handleChangeFile)
        fileInput.addEventListener("change", (e) => handleChangeFile(e))

        const file = new File(["test"], "test.png", { type: "image/png" })
        userEvent.upload(fileInput, file);

        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()
        expect(fileInput.files[0]).toStrictEqual(file)
      })

      test("Then the selection of a file in a wrong format should display an error message", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const employeeNewBillSubmit = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })
        jest.spyOn(window, "alert").mockImplementation(() => {});
        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn(employeeNewBillSubmit.handleChangeFile);
        fileInput.addEventListener("change", (e) => handleChangeFile(e));

        const file = new File(["test"], "test.gif", { type: "image/gif" });
        userEvent.upload(fileInput, file);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
      })
    })
  })
})
