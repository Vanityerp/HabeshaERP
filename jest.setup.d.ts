import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number | string[]): R
      toBeDisabled(): R
      toBeRequired(): R
      toHaveFocus(): R
      toBeChecked(): R
      toBeVisible(): R
      toBeEmpty(): R
      toBeInvalid(): R
      toBeValid(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveAccessibleDescription(description?: string | RegExp): R
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveDescription(description?: string | RegExp): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toHaveErrorMessage(message?: string | RegExp): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveStyle(css: string | Record<string, any>): R
      toBePartiallyChecked(): R
    }
  }
}
