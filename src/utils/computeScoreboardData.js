/**
 * Oblicza dane do wyświetlenia w tabelce scoreboarda.
 * @param {Array} cars - Lista samochodów z danymi wyścigu.
 * @param {number} pathLength - Długość toru.
 * @returns {Array} Zaktualizowana lista samochodów z polami: position, interval i distPercent.
 */
export function computeScoreboardData(cars, pathLength) {
  // Sortujemy samochody: najpierw te z większą liczbą okrążeń,
  // a przy równych okrążeniach według przebytych dystansów (od największego)
  const sortedCars = [...cars].sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    const rawA = ((a.distanceTraveled % pathLength) + pathLength) % pathLength;
    const rawB = ((b.distanceTraveled % pathLength) + pathLength) % pathLength;
    return rawB - rawA;
  });

  return sortedCars.map((car, idx) => {
    const position = idx + 1;
    // Obliczanie interwału (gap) - dla pierwszego auta gap wynosi 0
    let interval = 0;
    if (idx > 0) {
      const frontCar = sortedCars[idx - 1];
      const rawCurrent = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
      const rawFront = ((frontCar.distanceTraveled % pathLength) + pathLength) % pathLength;
      const gapDistance = (frontCar.laps - car.laps) * pathLength + (rawFront - rawCurrent);
      interval = gapDistance / frontCar.tires.speed;
      if (interval < 0) interval = 0;
    }

    // Obliczanie dystansu w aktualnym okrążeniu (w procentach)
    const normalizedDistance = ((car.distanceTraveled % pathLength) + pathLength) % pathLength;
    const distPercent = Math.round((normalizedDistance / pathLength) * 100);

    return { ...car, position, interval, distPercent };
  });
}
