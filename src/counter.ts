export function setupCounter(element: HTMLButtonElement): void {
  let counter: number = 0;

  const setCounter: (count: number) => void = (count: number): void => {
    counter = count;
    element.textContent = `Count is ${counter}`;
  };

  element.addEventListener('click', (): void => {
    setCounter(counter + 1);
  });

  setCounter(0);
}
