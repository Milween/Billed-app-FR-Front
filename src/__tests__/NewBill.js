/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value : localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
         type: "Employee",
        })
      )
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId("icon-mail")
      expect(mailIcon.className).toContain("active-icon")
    })

    test('Then the format must appear', () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
      expect(screen.getByTestId("button")).toBeTruthy()
    })
    describe("When I submit the form ", () => {
      test("Then I upload a file in right format ", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        mockStore.bills = jest.fn().mockImplementation(() => {
          return {
            create: () => {
              return Promise.resolve({})
            },
          }
        });

        const onNavigate = (pathname) => {
          document.body.innerHTML = pathname
        };

        const newBill = new NewBill({ 
          document,
          onNavigate,
          store: mockStore,
          bills,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
          },
        });
        jest.spyOn(window, "alert"); 
        expect(inputFile).toBeTruthy()
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()

        jest.spyOn(window, "alert").mockImplementation(() => {})

        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()
        expect(typeof inputFile.files[0]).toStrictEqual(typeof new File(["file.pdf"], "file.pdf", { type: "file/pdf" }))
      })

      test("Then I upload a file in a format that isn't corresponding to the criteria", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        mockStore.bills = jest.fn().mockImplementation(() => {
          return {
            create: () => {
              return Promise.resolve({})
            }
          }
        })

        const onNavigate = (pathname) => {
          document.body.innerHTML = pathname
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          bills,
          localStorage: window.localStorage,

        });

        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
          }
        })
        jest.spyOn(window, "alert").mockImplementation(() => {})

        expect(inputFile).toBeTruthy();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
      });
    });

    test("Then the new bill is created ", () => {
      const html = NewBillUI();
      document.body.innerHTML = html

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({})
          },
        };
      });

      const OnNavigate = (pathname) => {
        document.body.innerHTML = pathname
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorageMock: window.localStorage,
      });

      const bill = {
        email: "a@a",
        type: "Hôtel et logement",
        name: "encore",
        amount: "400",
        date: "2004-04-04",
        vat: 80,
        pct: 20,
        commentary: "séminaire billed",
        fileUrl: "test.png",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        status: "pending",
      }

      screen.getByTestId("expense-name").value = bill.name
      screen.getByTestId("datepicker").value = bill.date
      screen.getByTestId("amount").value = bill.amount
      screen.getByTestId("vat").value = bill.vat
      screen.getByTestId("pct").value = bill.pct
      screen.getByTestId("commentary").value = bill.commentary
      newBill.fileName = bill.fileName
      newBill.fileUrl = bill.fileUrl

      const form = screen.getByTestId("form-new-bill")
      newBill.updateBill = jest.fn()
      const submitForm = jest.fn((e) => {
        newBill.handleSubmit(e)
      });
      
      form.addEventListener("submit", submitForm)
      fireEvent.submit(form)

      expect(submitForm).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    });

    test("Then the error 500 occurs ", async () => {
      // Naviguer dans une new bill.
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"))
          },
        }
      })

      const form = screen.getByTestId("form-new-bill")
      newBill.updateBill = jest.fn()
      const submitForm = jest.fn((e) => {
        newBill.handleSubmit(e)
      })
      form.addEventListener("submit", submitForm)
      fireEvent.submit(form)

      jest.spyOn(console, "error").mockImplementation(() => {})
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })
})
