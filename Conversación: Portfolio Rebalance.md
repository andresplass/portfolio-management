# Conversación: Portfolio Rebalance en TypeScript

*Fecha: 3 de noviembre de 2026*

---

## 1. Pregunta inicial

> Tengo esta implementación que hacer, ¿me das ejemplos de portfolio rebalance que existan? Quizás el más simple y cómo se aplica en código como ejemplo (TypeScript).
>
> * Construct a simple Portfolio class that has a collection of Stocks. Assume each Stock has a "Current Price" method that receives the last available price. Also, the Portfolio class has a collection of "allocated" Stocks that represents the distribution of the Stocks the Portfolio is aiming (i.e. 40% META, 60% APPL)
> * Provide a portfolio rebalance method to know which Stocks should be sold and which ones should be bought to have a balanced Portfolio based on the portfolio's allocation.

### Respuesta

**Tipos de rebalanceo que se usan en la práctica**

- **Por calendario (periódico):** cada mes, trimestre o año vuelves a los pesos objetivo, sin importar cuánto se hayan movido. Es el más simple y el que suelen usar muchos fondos indexados.
- **Por umbral o bandas:** solo rebalanceas cuando una acción se desvía más de cierto margen (por ejemplo, ±5 puntos de su peso objetivo). Es lo típico en robo-advisors como Betterment o Wealthfront, porque evita operar por cambios mínimos.
- **Con flujos de caja:** en vez de vender, usas los aportes nuevos (o los retiros) para comprar lo que está bajo su peso. Así reduces comisiones e impuestos.
- **Constant-mix (por ejemplo, 60/40 acciones/bonos):** mantener una proporción fija. Es exactamente lo que pide el enunciado.

**El algoritmo más simple**

1. Calculas el valor total: `Σ acciones × precio actual`.
2. Para cada acción, el valor objetivo es `total × peso objetivo`.
3. La diferencia es `objetivo − valor actual`. Si es positiva, compras; si es negativa, vendes. La cantidad de acciones es `|diferencia| / precio`.

---

## 2. Solo la lógica del rebalance

> ok pero en ejemplo de código solo la parte del rebalance. Es para entender cómo se hace en general un rebalance

### Respuesta

```ts
function rebalance(holdings, prices, targets) {
  // 1. Valor total del portfolio
  const total = Object.keys(holdings)
    .reduce((sum, s) => sum + holdings[s] * prices[s], 0);

  // 2. Para cada acción: ¿cuánto debería tener vs cuánto tengo?
  return Object.keys(targets).map(symbol => {
    const current = (holdings[symbol] ?? 0) * prices[symbol];
    const target  = total * targets[symbol];
    const diff    = target - current;

    return {
      symbol,
      action: diff > 0 ? "BUY" : "SELL",
      shares: Math.abs(diff) / prices[symbol],
    };
  });
}
```

La idea completa cabe en tres pasos:

1. **Sumas** cuánto vale todo el portfolio hoy, con los precios actuales.
2. **Multiplicas** ese total por el porcentaje objetivo de cada acción, y eso te da cuánta plata *debería* haber en cada una.
3. **Restas** lo que debería haber menos lo que hay. Si te falta, compras; si te sobra, vendes. Para pasar de plata a acciones divides por el precio.

Ejemplo, con un portfolio de $7.000 y un objetivo de 40% en META:

- Deberías tener $2.800 en META.
- Tienes $5.000.
- Te sobran $2.200, así que vendes $2.200 / $500 = 4,4 acciones.

Un portfolio se desbalancea porque los precios se mueven. Si META sube mucho, pasa a pesar más del 40%. El rebalance es "vender lo que subió y comprar lo que quedó atrás" para volver a los porcentajes definidos.

---

## 3. Parámetros para evitar operaciones innecesarias

> hay algún otro parámetro que se use por ejemplo, para no vender o para no comprar? (Me imagino que si el cambio es muy chico puede perderse plata en la transacción.)

### Respuesta

**1. Umbral de desviación (bandas).** Solo rebalanceas si el peso actual se aleja del objetivo más de cierto margen.

- **Absoluto:** por ejemplo ±5 puntos. Si el objetivo es 40%, no haces nada mientras esté entre 35% y 45%.
- **Relativo:** por ejemplo ±25% *del peso objetivo*. Para un 40% la banda va de 30% a 50%; para un 4%, de 3% a 5%. Es más justo con las posiciones chicas.
- Regla clásica "5/25": ±5 puntos para posiciones grandes y ±25% relativo para las chicas.

**2. Monto mínimo de operación.** Si la orden es de $15 y la comisión es de $5, no conviene. Se ignora cualquier orden menor a X.

**3. Costos de transacción.** Se resta la comisión y el spread (diferencia entre precio de compra y de venta) antes de decidir. Si el beneficio de acercarse al objetivo es menor que el costo, no se opera.

**4. Impuestos.** Vender con ganancia puede generar impuestos, así que muchos sistemas prefieren no vender y rebalancear con plata nueva.

**5. Rebalanceo con flujos de caja.** Usar los depósitos nuevos para comprar solo lo que falta, en lugar de vender lo que sobra.

**6. Acciones enteras.** Si el broker no permite fracciones, redondear hacia abajo y aceptar quedar un poco desbalanceado.

Los dos primeros son solo un par de `if` dentro del loop:

```ts
const currentWeight = current / total;
const drift = Math.abs(currentWeight - targets[symbol]);

if (drift < threshold) continue;               // dentro de la banda
if (Math.abs(diff) < minTradeAmount) continue; // orden muy chica
```

---

## 4. Agregar costo de transacción

> agregaría el costo de transacción, no es al final solo variar con un limite más alto si le agregamos impuestos u otros?

### Respuesta

No es exactamente lo mismo que los otros dos. El umbral y el monto mínimo solo **filtran** órdenes. El costo de transacción, además de filtrar, **cambia los números**, porque la comisión se come parte de la plata.

En una venta de $2.200 con comisión de 1%, llegan $2.178, no $2.200. Ya no alcanza para comprar los $2.200 de AAPL calculados, y el rebalance tiene que tomar eso en cuenta.

Modelo simple de costo, fijo + porcentaje:

```ts
const fee = (amount: number) => fixedFee + amount * feeRate;
```

Se usa en dos lugares.

**1. Filtrar órdenes que no valen la pena.**

```ts
if (fee(Math.abs(diff)) / Math.abs(diff) > maxFeeRatio) continue;
// ej: maxFeeRatio = 0.02 → no pagar más de 2% en comisión
```

**2. Ajustar las compras a la caja real.**

```ts
// Caja real que entra por ventas
const cash = sells.reduce((sum, o) => sum + o.amount - fee(o.amount), 0);

// Lo que costarían las compras, incluyendo su comisión
const needed = buys.reduce((sum, o) => sum + o.amount + fee(o.amount), 0);

// Si no alcanza, escalar todas las compras proporcionalmente
const scale = Math.min(1, cash / needed);
buys.forEach(o => {
  o.amount *= scale;
  o.shares = o.amount / prices[o.symbol];
});
```

Conviene separar el método en dos pasos: primero calcular las órdenes ideales y después aplicar costos y ajustar las compras. Así el cálculo base sigue limpio y los costos quedan como una capa encima.

El resultado no queda perfectamente balanceado, sino un poco por debajo en las compras. Eso es correcto: es el costo real de rebalancear.