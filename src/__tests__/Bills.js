/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import Bills from "../containers/Bills";

import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { get } from "express/lib/response";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //added an expression

      expect(windowIcon.className).toContain('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("when I click on button 'Nouvelle note de frais' ", () => {
    test("Then, it should render NewBill page ", () => {
      Object.defineProperty(window, "localStorage", {
        value : localStorageMock,
      })
      window.localStorage.setItem("user", JSON.stringify({ type : "Employee" }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname
      }

      const billsContainer = new Bills ({
        document,
        onNavigate,
        store : mockStore,
        localeStorage : window.localStorage,
      })

      const btn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      btn.addEventListener('click', handleClickNewBill)
      userEvent.click(btn)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })

  describe("When i click on button 'IconEye' ", () => {
    test("Then a modal should open ", () => {
      Object.defineProperty(window, "localeStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const handleShowModalFile = jest.fn((e) => {
        billsContainer.handleClickIconEye(e.target)
      });

      iconEye.addEventListener("click", handleShowModalFile)
      userEvent.click(iconEye)

      expect(handleShowModalFile).toHaveBeenCalled()
      expect(screen.getAllByText("Justificatif")).toBeTruthy()
    })
  })
})
