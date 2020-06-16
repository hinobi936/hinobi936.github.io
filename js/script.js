document.addEventListener('DOMContentLoaded', () => {
    const thick_k = document.getElementById('material-width_k');
    const thick_p = document.getElementById('material-width_p');
    const thick_tzp = document.getElementById('material-width_tzp');
    const thick_Xmc = document.getElementById('material-width_xmc');

    const lambda_k = document.getElementById('lambda_k');
    const cp_k = document.getElementById('cp_k');
    const ro_k = document.getElementById('ro_k');

    const lambda_p = document.getElementById('lambda_p');
    const cp_p = document.getElementById('cp_p');
    const ro_p = document.getElementById('ro_p');

    const ro_tzp = document.getElementById('ro_tzp');

    const temperatureValues = document.getElementById('temperatureValues');

    const calculateBtn = document.getElementById('calculate');
    const inputs = document.querySelectorAll('input');
    const dataOut = document.getElementById('dataOut');

    let
        // толщина крышки, подложки, углеалстика и координаты Xmc соответственно
        thick_kVal, thick_pVal, thick_tzpVal, thick_XmcVal,
        // теплопроводность крышки и подложки соответственно
        lambda_kVal, lambda_pVal,
        // теплоемкость крышки и подложки соответственно
        cp_kVal, cp_pVal,
        // плотность крышки, подложки и углепластика соответственно
        ro_kVal, ro_pVal, ro_tzpVal;

    const tempVal = {}

    // let lambdaVal, cpVal, roVal, timeVal, edgeLeftVal, edgeRightVal,
    //     N, K, materialWidthVal, firstTimeVal;

    let myCanvas = document.getElementById("graf");
    let ctx = myCanvas.getContext("2d");

    let width_layer, time_layer, calculateData;
    calculateData = document.createElement('p');

    // двумерный массив данных для температур
    let T = [];
    let Txy = []; //для canvas
    // одномерные массивы 
    let alfa = [0], beta = [0], A = [0], B = [0], C = [0], F = [0];

    document.body.addEventListener('input', (e) => {
        element = e.target.tagName;
        // проверка принадлежности к Input
        if (element === 'INPUT') {
            // console.log(element);
            checkEmpty();
            changeBorderInput();
        };
    })

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
    };

    function changeBorderInput() {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value == "") {
                inputs[i].style.border = "1px solid red";
            }
            else {
                inputs[i].style.border = "";
            }
        }
    };
    // обновление всех переменных
    function updateValues() {
        thick_kVal = Number(thick_k.value),
            thick_pVal = Number(thick_p.value),
            thick_tzpVal = Number(thick_tzp.value),
            thick_XmcVal = Number(thick_Xmc.value),
            lambda_kVal = Number(lambda_k.value),
            lambda_pVal = Number(lambda_p.value),
            cp_kVal = Number(cp_k.value), cp_pVal = Number(cp_p.value),
            ro_kVal = Number(ro_k.value), ro_pVal = Number(ro_p.value),
            ro_tzpVal = Number(ro_tzp.value);
    };

    // чтение данных из таблицы в массив
    function readTemperature() {
        // table
        const currRows = temperatureValues.querySelectorAll('tr')
        // чтение строки (tr)
        for (let j = 1; j < currRows.length; j++) {
            tempVal[j] = []
            const currRow = currRows[j]
            const cells = currRow.querySelectorAll('td')

            // чтение столбцов (td)
            for (let k = 0; k < cells.length - 1; k++) {
                let name = cells[k].children[0].name;
                // запись значения столбца в массив 
                tempVal[j][name] = cells[k].children[0].value;
                // console.log(cells[k].children[0].value)
            }
        }
        console.log(tempVal)
    }
    // расчет теплопроводности и теплоемкости
    function createMasCharacteristic(massiv) {
        // определяем количество строк в таблице
        let N = Object.keys(massiv).length;
        // console.log(Object.keys(massiv).length-1);
        let time = [], tempK = [], tempP = [], tempTZP = [],
            bk, bp, bmc, tk, tp, tx_tau;

        // заполняем массивы time, tempK, tempP, tempTZP
        for (let i = 0; i < N; i++) {
            time[i] = massiv[i + 1].time;
            tempK[i] = massiv[i + 1].tempK;
            tempP[i] = massiv[i + 1].tempP;
            tempTZP[i] = massiv[i + 1].tempTZP;
        }

        //рассчет данных
        for (let i = 0; i < N - 1; i++) {
            // расчет коэффициентов bk, bp, bmc
            //toFixed - округление до 3 точки после запятой
            bk = ((tempK[i + 1] - tempK[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3);
            bp = ((tempP[i + 1] - tempP[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3);
            bmc = ((tempTZP[i + 1] - tempTZP[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3);
            console.log(bk, bmc, bp);

            let a = lambda_kVal / (cp_kVal * ro_kVal);
            // число Фурье при всех итерациях в расчете вышло меньше 0.004 
            let Fo = a * (time[i + 1] - time[i]) / thick_tzpVal;
            console.log(Fo);

            // расчет констант с1 и с2 для квадратного уравнения
            let c1 = ((tempK[i] - tempP[i]) * Math.pow(thick_XmcVal, 2) -
                (tempK[i] - tempTZP[i]) * Math.pow(thick_tzpVal, 2)) /
                (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
            console.log(c1);
            let c2 = ((tempK[i] - tempTZP[i]) * thick_tzpVal - (tempK[i] - tempP[i]) * thick_XmcVal) /
                (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
            console.log(c2);

            // рассчитываем интеграл
            tx_tau = tempTZP[i] * thick_tzpVal +
                c1 * (Math.pow(thick_tzpVal, 2) / 2) + c2 * (Math.pow(thick_tzpVal, 3) / 3);
            console.log(tx_tau);

        }
    };

    function printMas() {
        dataOut.innerHTML = '';
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
        let table = document.createElement('table');
        for (let i = 0; i <= K + 1; i++) {
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            th.setAttribute('colspan', N + 2);
            th.style.backgroundColor = 'lightgray';
            th.innerHTML = `<hr>ШАГ по времени = ${i}<hr>`;
            tr.appendChild(th);
            table.appendChild(tr);

            tr = document.createElement('tr');
            for (let j = 0; j <= N + 1; j++) {
                let th = document.createElement('th');
                th.innerHTML = ` СЛОЙ ${j}`;
                tr.appendChild(th);
            }
            table.appendChild(tr);

            tr = document.createElement('tr');
            for (let j = 0; j <= N + 1; j++) {
                let td = document.createElement('td');
                td.innerHTML = T[j][i].toFixed(3);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        dataOut.appendChild(table);

    };

    function printGraf() {
        myCanvas.width = K;
        myCanvas.height = N;
        ctx.clear;
        ctx.transform(1, 0, 0, -1, 0, myCanvas.height)
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
            drawLine(ctx, (i - 1), (Txy[i - 1]), i, Txy[i]);
            console.log(ctx);
        }
    };

    function drawLine(ctx, startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    };

    calculateBtn.addEventListener('click', () => {
        event.preventDefault();
        updateValues();
        readTemperature()
        createMasCharacteristic(tempVal);
        // printMas();
        // printGraf();
    })

    document.addEventListener('click', (e) => {
        // console.log(e)
    })


});
