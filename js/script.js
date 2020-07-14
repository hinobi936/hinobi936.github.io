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

  const ro_tzp = document.getElementsByClassName("ro_tzp");
  const cp_tzp = document.getElementById("cp_tzp");
  console.log(ro_tzp.length);

  const temperatureValues = document.querySelectorAll("table");

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
    ro_tzpVal = [],
    cp_tzpVal,
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

  let //time = [],
    //   tempK = [],
    //   tempP = [],
    //   tempTZP = [],
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
    znamenatel = [],
    tmc = [],
    tkas = 20,
    thick_pEq = [],
    cp_iz = 1500,
    ro_iz = 550,
    thick_iz = 0.025,
    tacp = [0],
    k = [0],
    Skeq = [],
    Speq = [],
    etaMc;
  // для рисования графика

  let myCanvas = document.getElementById("graf");
  let ctx = myCanvas.getContext("2d");

  let calculateData;
  calculateData = document.createElement("p");

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
      (lambda_pVal = Number(lambda_p.value)),
      (cp_kVal = Number(cp_k.value)),
      (cp_pVal = Number(cp_p.value)),
      (ro_kVal = Number(ro_k.value)),
      (ro_pVal = Number(ro_p.value)),
      // (ro_tzpVal = Number(ro_tzp.value)),
      (cp_tzpVal = Number(cp_tzp.value)),
      (CpMc = [0]),
      (LambdaMc = [0]);
    for (let i = 0; i < ro_tzp.length; i++) {
      ro_tzpVal[i] = Number(ro_tzp[i].value);
      console.log(ro_tzpVal[i]);
    }
  }

  // чтение данных из таблицы в массив
  function readTemperature() {
    // table
    // чтение таблицы (table)
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
          // console.log(cells[k].children[0].value);
        }
      }
      // console.log(tempVal);
    }
  }
  // расчет теплопроводности и теплоемкости
  function createMasCharacteristic(massiv) {
    etaMc = thick_XmcVal / thick_tzpVal;
    console.log(massiv);
    // определяем количество строк в таблице (N - количество строк)
    // N = Object.keys(massiv).length;
    Mas = Object.keys(massiv).length;
    // console.log(Object.keys(massiv).length-1);

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
      console.log("________________________________");
      console.log("____________", "t = ", t, "____________");
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
        (lambda_mc[t] = []),
        (cp_mc[t][0] = cp_tzpVal),
        (lambda_mc[t][0] = 0),
        (tmc[t] = []),
        (tacp[t] = []),
        (thick_pEq[t] = []),
        (Skeq[t] = []),
        (Speq[t] = []);

      for (let i = 1; i < calcVal[t].length; i++) {
        time0 = calcVal[t][i - 1].time;
        time1 = calcVal[t][i].time;
        tempK0 = calcVal[t][i - 1].tempK;
        tempK1 = calcVal[t][i].tempK;
        tempTZP0 = calcVal[t][i - 1].tempTZP;
        tempTZP1 = calcVal[t][i].tempTZP;
        tempP0 = calcVal[t][i - 1].tempP;
        tempP1 = calcVal[t][i].tempP;

        console.log("________________________________");
        console.log("____________", "i = ", i, "____________");
        // console.log("i = ", i);

        // расчет коэффициентов bk, bp, bmc
        //toFixed - округление до 3 точки после запятой
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

        let a = Number(0.7 / (1200 * ro_tzpVal[t]));
        // число Фурье при всех итерациях в расчете вышло меньше 0.004
        let Fo = (a * (time1 - time0)) / (thick_tzpVal * thick_tzpVal);
        // console.log(Fo);

        // расчет констант с1 и с2 для квадратного уравнения
        c1[t][i] =
          ((tempK0 - tempP0) * Math.pow(thick_XmcVal, 2) -
            (tempK0 - tempTZP0) * Math.pow(thick_tzpVal, 2)) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
        // console.log(c1);
        // c1[t][i] = c1[t][i].toFixed(3);
        c2[t][i] =
          ((tempK0 - tempTZP0) * thick_tzpVal -
            (tempK0 - tempP0) * thick_XmcVal) /
          (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
        // c2[t][i] = c2[t][i].toFixed(3);

        // рассчитываем интеграл
        // tx_tau[t][i] =
        // tempP0 * thick_tzpVal +
        // c1[t][i] * (Math.pow(thick_tzpVal, 2) / 2) +
        // c2[t][i] * (Math.pow(thick_tzpVal, 3) / 3);
        // tx_tau[t][i] = tx_tau[t][i].toFixed(3);
        tx_tau[t][i] =
          (thick_XmcVal * (tempK1 + tempTZP1)) / 2 +
          ((thick_tzpVal - thick_XmcVal) / 2) * tempTZP1 +
          ((thick_tzpVal - thick_XmcVal) / 2) * tempP1;
        console.log("интеграл tx_tau = ", tx_tau);

        let hpe =
          thick_pVal * Math.sqrt((0.7 * 920 * 2700) / (1500 * 550 * 100));
        console.log(hpe);

        // температура межслоя средняя
        tmc[t][i] = (tempK1 - tempTZP1) / (tempK1 - tempP1);
        console.log("tmci = ", tmc[t][i]);

        // расчет толщины подложки эквивалентной

        thick_pEq[t][i] =
          (cp_iz * ro_iz * thick_iz * (tempP1 + tkas)) /
          (cp_pVal * ro_pVal * 2 * tempP1);
        console.log("delta пэi = ", thick_pEq[t][i]);

        // средняя температура tacpi
        tacp[t][i] =
          (cp_kVal * ro_kVal * thick_kVal * tempK1 +
            cp_pVal * ro_pVal * thick_pEq[t][i] * tempP1 +
            cp_mc[t][i - 1] * ro_tzpVal[t] * tx_tau[t][i]) /
          (cp_kVal * ro_kVal * thick_kVal +
            cp_mc[t][i - 1] * ro_tzpVal[t] * thick_tzpVal +
            cp_pVal * ro_pVal * thick_pEq[t][i]);
        console.log("tacp = ", tacp[t][i]);

        // k[i] = thick_pEq[t][i] / thick_pVal;
        // console.log("ki = ", k[i]);
        // k[i] = thick_pVal / thick_pVal;
        k[i] = 1.2;
        console.log("ki = ", k[i]);

        // тепловой поток Skeq
        Skeq[t][i] =
          bk[t][i] *
          ((Math.sqrt(Math.PI) / 2) *
            Math.sqrt(lambda_kVal * cp_kVal * ro_kVal) -
            (cp_kVal * ro_kVal * thick_kVal) / Math.sqrt(time1 - time0));
        console.log("Skei = ", Skeq[t][i]);

        Speq[t][i] =
          Skeq[t][i] * k[i] +
          (bp[t][i] * (cp_pVal * ro_pVal * thick_pEq[t][i])) /
            (2 * Math.sqrt(time1 - time0));

        console.log("Spei = ", Speq[t][i]);

        // расчет теплопроводности (в районе 1 ~ 1.1 это норма)
        lambda_mc[t][i] =
          (1.6 * ((Skeq[t][i] - Speq[t][i]) * thick_tzpVal)) /
          (tempK1 - tempP1);
        console.log("lambda новая версия = ", lambda_mc[t][i]);

        // lambda_mc[t][i] =
        // (thick_tzpVal * Skeq[t][i] * (etaMc * etaMc - etaMc)) /
        // ((tempK1 - tempP1) * (etaMc * etaMc - tmc[t][i]));

        console.log("lambda = ", lambda_mc[t][i]);
        // lambda_mc[t][i] = Number(lambda_mc[t][i].toFixed(3));

        // рассчет теплоемкости cp[i]
        // chislitel = Skeq[t][i] * (etaMc - tmc[t][i]) * (time1 - time0);
        // znamenatel =
        //   ro_tzpVal *
        //   thick_tzpVal *
        //   (tempK1 -
        //     tacp[t][i] +
        //     (Skeq[t][i] *
        //       thick_tzpVal *
        //       (3 * (etaMc * etaMc) - 2 * etaMc - tmc[t][i])) /
        //       (6 * lambda_mc[t][i] * (etaMc * etaMc - tmc[t][i])));
        // cp_mc[t][i] = chislitel / znamenatel;
        // cp_mc[t][i] =
        // (lambda_mc[t][i] * ((tempK1 - tempP1) * (tempK1 - tempP1))) /
        // (bp[t][i] * bp[t][i] * (thick_tzpVal * thick_tzpVal));

        znamenatel =
          (3.14 / 4) *
          ((thick_tzpVal * thick_tzpVal * bk[t][i] * bk[t][i]) /
            ((tempK1 - tacp[t][i]) * (tempK1 - tacp[t][i])));

        cp_mc[t][i] = (lambda_mc[t][i] / ro_tzpVal[t]) * (1 / znamenatel);
        // cp_mc[t][i] =
        // (4 / (3.14 * ro_tzpVal * lambda_mc[t][i])) *
        // Math.pow(
        // (Math.sqrt(Math.PI) / 2) *
        // Math.sqrt(lambda_kVal * cp_kVal * ro_kVal) -
        // (cp_kVal * ro_kVal * thick_kVal) / Math.sqrt(time1 - time0),
        // 2
        // );

        console.log("cp = ", cp_mc[t][i]);
        // console.log('--------------------');

        // cp_mc[t][i] = Number(cp_mc[t][i].toFixed(3));
      }

      CpMc[t] = 0;
      LambdaMc[t] = 0;

      // среднее арифметическое значений теплоемкости и теплопроводности
      for (let i = 1; i < calcVal[t].length; i++) {
        // console.log("________________________________");
        CpMc[t] += cp_mc[t][i];
        LambdaMc[t] += lambda_mc[t][i];
        console.log("CpMc[t] = ", CpMc, "LambdaMc[t] = ", LambdaMc);
      }

      console.log("________________________________");
      console.log("****", "средне-арифметическое значение", "****");
      CpMc[t] = Number(CpMc[t] / (calcVal[t].length - 1).toFixed(3));
      LambdaMc[t] = Number(LambdaMc[t] / (calcVal[t].length - 1).toFixed(3));
      console.log("CpMc[t] = ", CpMc);
      console.log("LambdaMc[t] = ", LambdaMc);
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
      let calculateData = document.createElement("p");
      calculateData.innerHTML = ` <hr> <br>
        Cреднее арифметичское сp и lambda для ${t + 1} испытания <br>
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
              (2 * thick_tzpVal * Math.sqrt(ro_tzpVal[t]))) * lcp[${i}] + 
            (1 / 3) * (bk[${i}] - bp[${i}] / 2) * cpl[${i}] = <br>
            ${tempK1} -
            ((Math.sqrt(${Math.PI}) * (${bk[t][i]} + ${
          bp[t][i]
        }) * (${time1} - ${time0})) /
              (2 * ${thick_tzpVal} * Math.sqrt(${ro_tzpVal[t]}))) *
              ${lcp[t][i]} +
            (1 / 3) * (${bk[t][i]} - ${bp[t][i]} / 2) * ${cpl[t][i]} = <br>
            ${tempK1} -
            ((${Math.sqrt(Math.PI)} * (${bk[t][i]} + ${
          bp[t][i]
        }) * (${time1} - ${time0})) /
              (2 * ${thick_tzpVal} * ${Math.sqrt(ro_tzpVal[t])})) *
              ${lcp[t][i]} +
            (1 / 3) * (${bk[t][i]} - ${bp[t][i]} / 2) * ${cpl[t][i]} = ${
          equal[t][i]
        }
          ;
          <br>
          <br> 
    
         Считаем теплоемкость на шаге<br>
    
          cp_mc[${i}] = chislitel / znamenatel = <br>
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

  function printMasLittle() {
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
      let calculateData = document.createElement("p");
      calculateData.innerHTML = ` <hr> <br>
        Cреднее арифметичское сp и lambda для ${t + 1} испытания <br>
        cp = ${CpMc[t]}, <br> lambda = ${LambdaMc[t]} `;
      dataOut.appendChild(calculateData);
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
    printMasLittle();
    // printGraf();
  });

  document.addEventListener("click", (e) => {
    e.preventDefault;
    if (
      e.target.classList.contains("deleteRow") &&
      e.target.parentNode.tagName == "TR"
    ) {
      let tr = e.target.parentNode;
      tr.parentNode.removeChild(tr);
    }
    // console.log(e.target.classList.contains('deleteRow'))
  });
});
