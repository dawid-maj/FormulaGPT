/**
 * Oblicza dane do wyświetlenia w tabelce scoreboarda.
 * @param {Array} cars - Lista samochodów z danymi wyścigu.
 * @param {number} pathLength - Długość toru.
 * @returns {Array} Zaktualizowana lista samochodów z polami: position, interval i distPercent.
 */
import { PITSTOP_TIME_PENALTY } from '../data/constants';

export function computeScoreboardData(cars, pathLength) {
  // Sortujemy samochody: najpierw te z większą liczbą okrążeń,
  // a przy równych okrążeniach według przebytych dystansów (od największego)
  const sortedCars = [...cars].sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    const rawA = ((a.distanceTraveled % pathLength) + pathLength) % pathLength;
    const rawB = ((b.distanceTraveled % pathLength) + pathLength) % pathLength;
    return rawB - rawA;
  });

  // Obliczamy dane dla każdego samochodu
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

    // Obliczanie projekcji pit stopu
    const pitProjection = calculatePitProjection(car, sortedCars, PITSTOP_TIME_PENALTY, car.tires.speed);

    return { ...car, position, interval, distPercent, pitProjection };
  });
}

/**
 * Oblicza projekcję pozycji i odstępu po pit stopie dla danego samochodu
 * @param {Object} car - Samochód, dla którego obliczamy projekcję
 * @param {Array} allCars - Wszystkie samochody w wyścigu
 * @param {number} pitStopPenalty - Strata czasu na pit stop w sekundach
 * @param {number} carSpeed - Prędkość samochodu w px/s
 * @returns {Object} Obiekt zawierający projectedPosition, projectedGap i carAhead
 */
function calculatePitProjection(car, allCars, pitStopPenalty, carSpeed) {
  // Obliczamy, o ile dystansu cofnie się samochód podczas pit stopu
  const distanceLoss = pitStopPenalty * carSpeed;
  
  // Symulujemy nową pozycję samochodu po pit stopie
  const projectedDistance = car.distanceTraveled - distanceLoss;
  
  // Znajdujemy, za którym samochodem będzie nasz samochód po pit stopie
  let projectedPosition = allCars.length;
  let projectedGap = 0;
  let carAhead = null;
  
  for (let i = 0; i < allCars.length; i++) {
    const otherCar = allCars[i];
    if (otherCar.name === car.name) continue; // Pomijamy ten sam samochód
    
    if (otherCar.distanceTraveled > projectedDistance) {
      // Ten samochód będzie przed naszym po pit stopie
      if (!carAhead || otherCar.distanceTraveled < carAhead.distanceTraveled) {
        carAhead = otherCar;
        projectedPosition = i + 1;
      }
    }
  }
  
  // Obliczamy gap do samochodu przed nami po pit stopie
  if (carAhead) {
    const gapDistance = carAhead.distanceTraveled - projectedDistance;
    projectedGap = gapDistance / carSpeed;
    if (projectedGap < 0) projectedGap = 0;
  }
  
  return {
    projectedPosition,
    projectedGap,
    carAhead: carAhead ? carAhead.name : null
  };
}
