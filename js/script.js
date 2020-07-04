document.addEventListener("DOMContentLoaded", () => {
  const thick_k = document.getElementById("material-width_k");
  const thick_p = document.getElementById("material-width_p");
  const thick_tzp = document.getElementById("material-width_tzp");
  const thick_Xmc = document.getElementById("material-width_xmc");

  const lambda_k = document.getElementById("lambda_k");
  const cp_k = document.getElementById("cp_k");
  const ro_k = document.getElementById("ro_k");

  const lambda_p = document.getElementById("lambda_p");
  const cp_p = document.getElementById("cp_p");
  const ro_p = document.getElementById("ro_p");

  const ro_tzp = document.getElementById("ro_tzp");

  const temperatureValues = document.querySelectorAll("table");
  console.log(temperatureValues);

  const calculateBtn = document.getElementById("calculate");
  const inputs = document.querySelectorAll("input");
  const dataOut = document.getElementById("dataOut");

  let // толщина крышки, подложки, углеалстика и координаты Xmc соответственно
    thick_kVal,
    thick_pVal,
    thick_tzpVal,
    thick_XmcVal,
    // теплопроводность крышки и подложки соответственно
    lambda_kVal,
    lambda_pVal,
    // теплоемкость крышки и подложки соответственно
    cp_kVal,
    cp_pVal,
    // плотность крышки, подложки и углепластика соответственно
    ro_kVal,
    ro_pVal,
    ro_tzpVal,
    // число итераций
    N,
    Mas;

  // переменные для хранения значений теплопроводности и теплоемкости углепластика
  let cp_mc = [],
    lambda_mc = [],
    CpMc = [0],
    LambdaMc = [0];

  // для записи данных времени и температур из таблицы измеренных температур
  const tempVal = {},
    calcVal = [];
  let // time = [],
    // tempK = [],
    // tempP = [],
    // tempTZP = [],
    time0,
    time1,
    tempK0,
    tempK1,
    tempTZP0,
    tempTZP1,
    tempP0,
    tempP1,
    bk = [],
    bp = [],
    bmc = [],
    tk,
    tp,
    c1 = [],
    c2 = [],
    tx_tau = [],
    cpl = [],
    lcp = [],
    equal = [],
    chislitel = [],
    znamenatel = [];
  // для рисования графика

  let myCanvas = document.getElementById("graf");
  let ctx = myCanvas.getContext("2d");

  let calculateData;
  calculateData = document.createElement("div");

  document.body.addEventListener("input", (e) => {
    element = e.target.tagName;
    // проверка принадлежности к Input
    if (element === "INPUT") {
      // console.log(element);
      checkEmpty();
      changeBorderInput();
    }
  });

  function checkEmpty() {
    // проверка всех полей на пустоту, блокировка кнопки при данном условии
    for (let i = 0; i < inputs.length; i++) {
      // console.log(inputs[i]);
      if (inputs[i].value == "") {
        calculateBtn.disabled = true;
        return;
      }
      inputs[i].style.border = "";
      calculateBtn.disabled = false;
      // enableCalculation();
      // console.log(inputs[i].value);
    }
  }

  function changeBorderInput() {
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value == "") {
        inputs[i].style.border = "1px solid red";
      } else {
        inputs[i].style.border = "";
      }
    }
  }
  // обновление всех переменных
  function updateValues() {
    (thick_kVal = Number(thick_k.value)),
      (thick_pVal = Number(thick_p.value)),
      (thick_tzpVal = Number(thick_tzp.value)),
      (thick_XmcVal = Number(thick_Xmc.value)),
      (lambda_kVal = Number(lambda_k.value)),
      // lambda_pVal = Number(lambda_p.value),
      (cp_kVal = Number(cp_k.value)),
      (cp_pVal = Number(cp_p.value)),
      (ro_kVal = Number(ro_k.value)),
      (ro_pVal = Number(ro_p.value)),
      (ro_tzpVal = Number(ro_tzp.value)),
      (CpMc = [0]),
      (LambdaMc = [0]);
  }

  // чтение данных из таблицы в массив
  function readTemperature() {
    // table
    for (let i = 0; i < temperatureValues.length; i++) {
      tempVal[i] = [];
      const currTable = temperatureValues[i];
      const currRows = currTable.querySelectorAll("tr");
      // чтение строки (tr)
      for (let j = 1; j < currRows.length; j++) {
        tempVal[i][j] = [];
        const currRow = currRows[j];
        const cells = currRow.querySelectorAll("td");

        // чтение столбцов (td)
        for (let k = 0; k < cells.length - 1; k++) {
          let name = cells[k].children[0].name;
          // запись значения столбца в массив
          tempVal[i][j][name] = cells[k].children[0].value;
          // console.log(cells[k].children[0].value)
        }
      }
      // console.log(tempVal);
    }
  }
  // расчет теплопроводности и теплоемкости
  function createMasCharacteristic(massiv) {
    // console.log(massiv);
    // определяем количество строк в таблице (N - количество строк)
    // N = Object.keys(massiv).length;
    Mas = Object.keys(massiv).length;
    // console.log(Object.keys(massiv).length);
    // console.log(massiv[0].length);
    // заполняем массивы time, tempK, tempP, tempTZP значениями из таблицы
    for (let i = 0; i < Mas; i++) {
      calcVal[i] = [];
      const currRows = massiv[i];
      for (let j = 0; j < currRows.length - 1; j++) {
        // console.log(massiv[i]);
        calcVal[i][j] = [];
        const currRow = currRows[j + 1];
        calcVal[i][j].time = Number(currRow.time);
        calcVal[i][j].tempK = Number(currRow.tempK);
        calcVal[i][j].tempTZP = Number(currRow.tempTZP);
        calcVal[i][j].tempP = Number(currRow.tempP);
      }
    }
    // console.log(calcVal);

    //рассчет данных
    for (let t = 0; t < Mas; t++) {
      (bk[t] = []), (bp[t] = []), (bmc[t] = []);
      (c1[t] = []),
        (c2[t] = []),
        (tx_tau[t] = []),
        (cpl[t] = []),
        (lcp[t] = []),
        (equal[t] = []),
        (chislitel[t] = []),
        (znamenatel[t] = []),
        (cp_mc[t] = []),
        (lambda_mc[t] = []);
      for (let i = 0; i < calcVal[t].length - 1; i++) {
        // bk[t][i]=[];
        // console.log(calcVal[t][i]);
        let time0 = calcVal[t][i].time;
        let time1 = calcVal[t][i + 1].time;
        let tempK0 = calcVal[t][i].tempK;
        let tempK1 = calcVal[t][i + 1].tempK;
        let tempTZP0 = calcVal[t][i].tempTZP;
        let tempTZP1 = calcVal[t][i + 1].tempTZP;
        let tempP0 = calcVal[t][i].tempP;
        let tempP1 = calcVal[t][i + 1].tempP;

        // console.log(calcVal[t][i].time);

        // расчет коэффициентов bk, bp, bmc
        //toFixed - округление до 3 точки после запятой
        console.log(t, i, tempK1, tempK0, time1, time0);

        bk[t][i] = Number(
          ((tempK1 - tempK0) / Math.sqrt(time1 - time0)).toFixed(3)
        );

        bp[t][i] = Number(
          ((tempP1 - tempP0) / Math.sqrt(time1 - time0)).toFixed(3)
        );
        bmc[t][i] = Number(
          ((tempTZP1 - tempTZP0) / Math.sqrt(time1 - time0)).toFixed(3)
        );
        // console.log(bk, bmc, bp);

        let a = Number(lambda_kVal / (cp_kVal * ro_kVal));
        // число Фурье при всех итерациях в расчете вышло меньше 0.004
        let Fo = (a * (time1 - time0)) / (thick_tzpVal * thick_tzpVal);

        // расчет констант с1 и с2 для квадратного уравнения
        c1[t][i] =
          ((tempK0 - tempP0) * Math.pow(thick_XmcVal, 2) -
            (tempK0 - tempTZP0) * Math.pow(thick_tzpVal, 2)) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
        // console.log(c1);
        c1[t][i] = c1[t][i].toFixed(3);
        c2[t][i] =
          ((tempK0 - tempTZP0) * thick_tzpVal -
            (tempK0 - tempP0) * thick_XmcVal) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
        c2[t][i] = c2[t][i].toFixed(3);

        // рассчитываем интеграл
        tx_tau[t][i] =
          tempP0 * thick_tzpVal +
          c1[t][i] * (Math.pow(thick_tzpVal, 2) / 2) +
          c2[t][i] * (Math.pow(thick_tzpVal, 3) / 3);
        tx_tau[t][i] = tx_tau[t][i].toFixed(3);
        // console.log(tx_tau);

        // рассчет теплоемкости cp[i]

        // cp/lambda
        cpl[t][i] = Number(((tempK0 - tempP0) / bp[t][i]).toFixed(3));
        console.log(cpl[t][i]);

        // lambda/cp
        lcp[t][i] = Number((bp[t][i] / (tempK0 - tempP0)).toFixed(3));

        equal[t][i] =
          tempK1 -
          ((Math.sqrt(Math.PI) * (bk[t][i] + bp[t][i]) * (time1 - time0)) /
            (2 * thick_tzpVal * Math.sqrt(ro_tzpVal))) *
            lcp[t][i] +
          (1 / 3) * (bk[t][i] - bp[t][i] / 2) * cpl[t][i];
        console.log(
          2 * thick_tzpVal * Math.sqrt(ro_tzpVal),
          lcp[t][i],
          (1 / 3) * (bk[t][i] - bp[t][i] / 2),
          cpl[t][i]
        );

        chislitel[t][i] =
          cp_kVal * ro_kVal * thick_kVal * tempK0 +
          cp_pVal * ro_pVal * thick_pVal * tempP0 -
          (cp_kVal * ro_kVal * thick_kVal + cp_pVal * ro_pVal * thick_pVal) *
            equal[t][i];
        znamenatel[t][i] =
          ro_tzpVal * thick_tzpVal * equal[t][i] - ro_tzpVal * tx_tau[t][i];
        cp_mc[t][i] = chislitel[t][i] / znamenatel[t][i];
        cp_mc[t][i] = Number(cp_mc[t][i].toFixed(3));
        // console.log(equal, chislitel, znamenatel, cp_mc);

        // расчет теплопроводности
        lambda_mc[t][i] =
          cp_mc[t][i] * ((bp[t][i] * bp[t][i]) / Math.pow(tempK1 - tempP1, 2));
        lambda_mc[t][i] = Number(lambda_mc[t][i].toFixed(3));
        console.log(cp_mc[t][i], lambda_mc[t][i]);
      }

      CpMc[t] = 0;
      LambdaMc[t] = 0;

      // среднее арифметическое значений теплоемкости и теплопроводности
      for (let i = 0; i < calcVal[t].length - 1; i++) {
        // CpMc[t]=[];
        CpMc[t] += cp_mc[t][i];
        // CpMc[t] += cp_mc[t][i];
        LambdaMc[t] += lambda_mc[t][i];
        // LambdaMc[t] += lambda_mc[t][i];
        console.log(CpMc[t], LambdaMc[t], cp_mc[t][i], lambda_mc[t][i]);
      }

      CpMc[t] = Number(CpMc[t] / Mas.toFixed(3));
      LambdaMc[t] = Number(LambdaMc[t] / Mas.toFixed(3));
      console.log(CpMc[t], LambdaMc[t]);
    }
  }

  function printMas() {
    dataOut.innerHTML = "";
    // вывод массива на страницу
    // for (let i = 0; i <= N + 1; i++) {
    //     calculateData = document.createElement('p');
    //     let row = document.createElement('p');
    //     row.className = 'widthLayer';
    //     row.innerHTML = `<hr>СЛОЙ ${i}<hr>`;
    //     dataOut.appendChild(row);
    //     for (let j = 0; j <= N + 1; j++) {
    //         time_layer = T[i][j].toFixed(3);
    //         calculateData.innerHTML += time_layer + ' | ШАГ ' + j + ' | ';
    //     };
    //     dataOut.appendChild(calculateData);
    // }

    // вывод массива на страницу 2й способ
    for (let t = 0; t < Mas; t++) {
      let calculateData = document.createElement("p")
      calculateData.innerHTML = ` <hr> <br>
      Cреднее арифметичское сp и lambda для ${t+1} испытания <br>
      cp = ${CpMc[t]}, <br> lambda = ${LambdaMc[t]} `;
      dataOut.appendChild(calculateData);

      let table = document.createElement("table");
      for (let i = 0; i < calcVal[t].length - 1; i++) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.style.backgroundColor = "lightgray";
        th.innerHTML = ` <em>i = ${i}</em>`;
        tr.appendChild(th);
        table.appendChild(tr);

        tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerHTML = `
        bk[${i}] = (tempK[${i + 1}] - tempK[${i}]) / Math.sqrt(time[${
          i + 1
        }] - time[${i}]) = <br>
        (${tempK1} - ${tempK0}) / Math.sqrt(${time1} - ${time0}) = <br>
        (${tempK1} - ${tempK0}) / ${Math.sqrt(time1 - time0)} = ${bk[t][i]}
        ;
        <br>
        <br>
  
        bp[${i}] = (tempP[${i + 1}] - tempP[${i}]) / Math.sqrt(time[${
          i + 1
        }] - time[${i}]) = <br>
        (${tempP1} - ${tempP0}) / Math.sqrt(${time1} - ${time0}) = <br>
        (${tempP1} - ${tempP0}) / ${Math.sqrt(time1 - time0)} = ${bp[t][i]}
        <br>
        <br>
  
        a = lambda_kVal / (cp_kVal * ro_kVal) = <br>
        ${lambda_kVal} / (${cp_kVal} * ${ro_kVal}) =  ${
          lambda_kVal / (cp_kVal * ro_kVal)
        }      
        ;
        <br>
        <br>
  
        // Число Фурье <br>
        Fo = a * (time[${
          i + 1
        }] - time[${i}]) / (thick_tzpVal * thick_tzpVal) = <br>
        ${lambda_kVal / (cp_kVal * ro_kVal)} * 
        (${time1} - ${time0}) / (${thick_tzpVal} * ${thick_tzpVal}) = 
        ${
          ((lambda_kVal / (cp_kVal * ro_kVal)) * (time1 - time0)) /
          (thick_tzpVal * thick_tzpVal)
        }      
        ;
        <br>
        <br>
  
        // Расчет констант с1 и с2 для квадратного уравнения <br><br>
  
        c1[${i}] =
          ((tempK[${i}] - tempP[${i}]) * Math.pow(thick_XmcVal, 2) -
            (tempK[${i}] - tempTZP[${i}]) * Math.pow(thick_tzpVal, 2)) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal)) = <br> <br>
          
          ((${tempK0} - ${tempP0}) * Math.pow(${thick_XmcVal}, 2) -
            (${tempK0} - ${tempTZP0}) * Math.pow(${thick_tzpVal}, 2)) /
          (${thick_tzpVal} * ${thick_XmcVal} * (${thick_tzpVal} - ${thick_XmcVal})) = ${
          c1[t][i]
        }
          ;
        <br>
        <br>
  
        c2[${i}] =
          ((tempK[${i}] - tempTZP[${i}]) * thick_tzpVal -
            (tempK[${i}] - tempP[${i}]) * thick_XmcVal) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal))= <br> <br>
  
          ((${tempK0} - ${tempTZP0}) * ${thick_tzpVal} - (${tempK0} - ${tempP0}) * ${thick_XmcVal}) /
          (${thick_tzpVal} * ${thick_XmcVal} * (${thick_tzpVal} - ${thick_XmcVal})) = ${
          c2[t][i]
        }
          ;
        <br>
        <br>
  
        // рассчитываем интеграл <br>
  
        tx_tau[${i}] = tempP[${i}] * thick_tzpVal + c1[${i}] * (Math.pow(thick_tzpVal, 2) / 2) +
          c2[${i}] * (Math.pow(thick_tzpVal, 3) / 3) = <br>
          ${tempP0} * ${thick_tzpVal} +
          ${c1[t][i]} * (Math.pow(${thick_tzpVal}, 2) / 2) +
          ${c2[t][i]} * (Math.pow(${thick_tzpVal}, 3) / 3) = <br>   
  
          ${tempP0} * ${thick_tzpVal} +
          ${c1[t][i]} * (${Math.pow(thick_tzpVal, 2)} / 2) +
          ${c2[t][i]} * (${Math.pow(thick_tzpVal, 3)} / 3) = ${tx_tau[t][i]}
        ;
        <br>
        <br>
  
        // рассчет теплоемкости cp[${i}] <br>
        // корень из cp/lambda <br>
        cpl[${i}] = (tempK[${i}] - tempP[${i}]) / bp[${i}]) = <br>
  
        (${tempK0} - ${tempP0}) / ${bp[t][i]} = ${cpl[t][i]}      
        ;
        <br>
        <br>
  
        // корень из lambda/cp <br>
        lcp[${i}] = bp[${i}] / (tempK[${i}] - tempP[${i}]) = <br>      
         ${bp[t][i]} / (${tempK0} - ${tempP0}) = ${lcp[t][i]}
        ;
        <br>
        <br>
  
        Общая скобка в числителе и знаменателе<br>
        equal =
          tempK[${i + 1}] -
          ((Math.sqrt(Math.PI) * (bk[${i}] + bp[${i}]) * (time[${
          i + 1
        }] - time[${i}])) /
            (2 * thick_tzpVal * Math.sqrt(ro_tzpVal))) * lcp[${i}] + 
          (1 / 3) * (bk[${i}] - bp[${i}] / 2) * cpl[${i}] = <br>
          ${tempK1} -
          ((Math.sqrt(${Math.PI}) * (${bk[t][i]} + ${
          bp[t][i]
        }) * (${time1} - ${time0})) /
            (2 * ${thick_tzpVal} * Math.sqrt(${ro_tzpVal}))) *
            ${lcp[t][i]} +
          (1 / 3) * (${bk[t][i]} - ${bp[t][i]} / 2) * ${cpl[t][i]} = <br>
          ${tempK1} -
          ((${Math.sqrt(Math.PI)} * (${bk[t][i]} + ${
          bp[t][i]
        }) * (${time1} - ${time0})) /
            (2 * ${thick_tzpVal} * ${Math.sqrt(ro_tzpVal)})) *
            ${lcp[t][i]} +
          (1 / 3) * (${bk[t][i]} - ${bp[t][i]} / 2) * ${cpl[t][i]} = ${
          equal[t][i]
        }
          ;
        <br>
        <br>
  
        Считаем числитель<br>
        chislitel =
          cp_kVal * ro_kVal * thick_kVal * tempK[${i}] +
          cp_pVal * ro_pVal * thick_pVal * tempP[${i}] -
          (cp_kVal * ro_kVal * thick_kVal + cp_pVal * ro_pVal * thick_pVal) * equal = <br>
            ${cp_kVal} * ${ro_kVal} * ${thick_kVal} * ${tempK0} +
          ${cp_pVal} * ${ro_pVal} * ${thick_pVal} * ${tempP0} -
          (${cp_kVal} * ${ro_kVal} * ${thick_kVal} + ${cp_pVal} * ${ro_pVal} * ${thick_pVal}) *
            ${equal[t][i]} = ${chislitel[t][i]}
            ;
        <br>
        <br>
  
        Считаем знаменатель<br>
        znamenatel = ro_tzpVal * thick_tzpVal * equal - ro_tzpVal * tx_tau[${i}] = <br>
        ${ro_tzpVal} * ${thick_tzpVal} * ${equal[t][i]} - ${ro_tzpVal} *${
          tx_tau[t][i]
        } = ${znamenatel[t][i]}
        
        ;
        <br>
        <br> 
  
       Считаем теплоемкость на шаге<br>
  
        cp_mc[${i}] = chislitel / znamenatel = <br>
        ${chislitel[t][i]} / ${znamenatel[t][i]} = ${cp_mc[t][i]}      
        ; 
        <br>
        <br>
  
        Расчет теплопроводности на шаге<br>
        lambda_mc[${i}] =
          cp_mc[${i}] * ((bp[${i}] * bp[${i}]) / Math.pow(tempK[${
          i + 1
        }] - tempP[${i + 1}], 2)) = <br>
          ${cp_mc[t][i]} * ((${bp[t][i]} * ${
          bp[t][i]
        }) / Math.pow(${tempK1} - ${tempP1}, 2)) = <br>   
          ${cp_mc[t][i]} * ((${bp[t][i]} * ${bp[t][i]}) / ${Math.pow(
          tempK1 - tempP1,
          2
        )}) =  ${lambda_mc[t][i]}  
          ;
        <br>
        `;

        tr.appendChild(td);

        table.appendChild(tr);
      }
      dataOut.appendChild(table);
    }
  }

  function printGraf() {
    myCanvas.width = K;
    myCanvas.height = N;
    ctx.clear;
    ctx.transform(1, 0, 0, -1, 0, myCanvas.height);
    ctx.strokeStyle = "BLUE";
    ctx.lineWidth = 1;
    ctx.setLineDash([1]);

    // создаем массив для canvas
    Txy = [];
    for (let i = 0; i <= K + 1; i++) {
      Txy[i] = 0;
    }

    // определяем координаты для построения
    for (let i = 1; i <= K + 1; i++) {
      for (let j = 0; j <= N - 1; j++) {
        if (T[N - j][i] >= T[N + 1 - j][i]) {
          Txy[i] = T[N - j][i];
        }
      }
      drawLine(ctx, i - 1, Txy[i - 1], i, Txy[i]);
      console.log(ctx);
    }
  }

  function drawLine(ctx, startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  calculateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    updateValues();
    readTemperature();
    createMasCharacteristic(tempVal);
    printMas();
    // printGraf();
  });

  document.addEventListener("click", (e) => {
    e.preventDefault;
    if (e.target.parentNode.tagName=="TR"){
      let tr =e.target.parentNode;
      tr.parentNode.removeChild(tr);
    }
    // console.log(e.target.parentNode.tagName)
  });
});
