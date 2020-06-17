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
        ro_kVal, ro_pVal, ro_tzpVal,
        // число итераций
        N;

    // переменные для хранения значений теплопроводности и теплоемкости углепластика
    let cp_mc = [], lambda_mc = [], CpMc = 0, LambdaMc = 0;

    // для записи данных времени и температур из таблицы измеренных температур
    const tempVal = {};
    let time = [], tempK = [], tempP = [], tempTZP = [],
        bk = [], bp = [], bmc = [], tk, tp, c1 = [], c2 = [], tx_tau = [];

    // для рисования графика

    let myCanvas = document.getElementById("graf");
    let ctx = myCanvas.getContext("2d");

    let calculateData;
    calculateData = document.createElement('p');

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
            ro_tzpVal = Number(ro_tzp.value),
            CpMc = 0, LambdaMc = 0;
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
        // console.log(tempVal)
    }
    // расчет теплопроводности и теплоемкости
    function createMasCharacteristic(massiv) {
        // определяем количество строк в таблице (N - количество строк)
        N = Object.keys(massiv).length;
        // console.log(Object.keys(massiv).length-1);

        // заполняем массивы time, tempK, tempP, tempTZP значениями из таблицы
        for (let i = 0; i < N; i++) {
            time[i] = Number(massiv[i + 1].time);
            tempK[i] = Number(massiv[i + 1].tempK);
            tempP[i] = Number(massiv[i + 1].tempP);
            tempTZP[i] = Number(massiv[i + 1].tempTZP);
        }

        //рассчет данных
        for (let i = 0; i < N - 1; i++) {
            // расчет коэффициентов bk, bp, bmc
            //toFixed - округление до 3 точки после запятой
            bk[i] = Number(((tempK[i + 1] - tempK[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3));
            bp[i] = Number(((tempP[i + 1] - tempP[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3));
            bmc[i] = Number(((tempTZP[i + 1] - tempTZP[i]) / Math.sqrt(time[i + 1] - time[i])).toFixed(3));
            // console.log(bk, bmc, bp);

            let a = lambda_kVal / (cp_kVal * ro_kVal);
            // число Фурье при всех итерациях в расчете вышло меньше 0.004 
            let Fo = a * (time[i + 1] - time[i]) / thick_tzpVal;
            // console.log(Fo);

            // расчет констант с1 и с2 для квадратного уравнения
            c1[i] = ((tempK[i] - tempP[i]) * Math.pow(thick_XmcVal, 2) -
                (tempK[i] - tempTZP[i]) * Math.pow(thick_tzpVal, 2)) /
                (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
            // console.log(c1);
            c1[i] = c1[i].toFixed(3)
            c2[i] = ((tempK[i] - tempTZP[i]) * thick_tzpVal - (tempK[i] - tempP[i]) * thick_XmcVal) /
                (thick_tzpVal * thick_XmcVal * (thick_tzpVal - thick_XmcVal));
            c2[i] = c2[i].toFixed(3)

            // console.log(c2);

            // рассчитываем интеграл
            tx_tau[i] = tempTZP[i] * thick_tzpVal +
                c1[i] * (Math.pow(thick_tzpVal, 2) / 2) + c2[i] * (Math.pow(thick_tzpVal, 3) / 3);
            tx_tau[i] = tx_tau[i].toFixed(3)

            // console.log(tx_tau);

            // рассчет теплоемкости cp[i]
            // console.log(
            //     tempK[i + 1],
            //     Math.sqrt(Math.PI),
            //     bk,
            //     bp,
            //     time[i + 1],
            //     time[i],
            //     thick_tzpVal,
            //     ro_tzpVal,
            //     Math.sqrt(ro_tzpVal),
            //     lambda_kVal,
            //     cp_kVal,
            //     Math.sqrt(lambda_kVal / cp_kVal),
            //     Math.sqrt(cp_kVal / lambda_kVal),
            //     Math.sqrt(Math.PI)
            // );

            let equal = (tempK[i + 1] - ((Math.sqrt(Math.PI)) * (bk[i] + bp[i]) * (time[i + 1] - time[i])
                / 2 * thick_tzpVal * Math.sqrt(ro_tzpVal)) * (Math.sqrt(lambda_kVal / cp_kVal)) +
                (1 / 3) * (bk[i] - bp[i] / 2) * (Math.sqrt(cp_kVal / lambda_kVal)));

            let chislitel = (cp_kVal * ro_kVal * thick_kVal * tempK[i] +
                cp_pVal * ro_pVal * thick_pVal * tempP[i]) -
                (cp_kVal * ro_kVal * thick_kVal + cp_pVal * ro_pVal * thick_pVal * equal);

            let znamenatel = ro_kVal * thick_tzpVal * equal - ro_tzpVal * tx_tau[i];
            cp_mc[i] = (chislitel / znamenatel);
            cp_mc[i] = Number(cp_mc[i].toFixed(3));
            // console.log(equal, chislitel, znamenatel, cp_mc);

            // расчет теплопроводности
            lambda_mc[i] = cp_mc[i] * (bp[i] * bp[i] / (tempK[i] - tempP[i]) * (tempK[i] - tempP[i]));
            lambda_mc[i] = Number(lambda_mc[i].toFixed(3));
            console.log(cp_mc[i], lambda_mc[i]);
        }

        // среднее арифметическое значений теплоемкости и теплопроводности
        for (let i = 0; i < N - 1; i++) {
            CpMc += cp_mc[i];
            LambdaMc += lambda_mc[i];
            console.log(CpMc, LambdaMc, cp_mc[i], lambda_mc[i]);
        }
        CpMc = Number(CpMc / (N - 1).toFixed(3));
        LambdaMc = Number(LambdaMc / (N - 1).toFixed(3));
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
        calculateData.innerHTML = ` Cp = ${CpMc}, <br> Lambda = ${LambdaMc} `;
        dataOut.appendChild(calculateData);

        let table = document.createElement('table');
        for (let i = 0; i < N - 1; i++) {
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            th.style.backgroundColor = 'lightgray';
            th.innerHTML = `<hr> <em>i = ${i}</em><hr>`;
            tr.appendChild(th);
            table.appendChild(tr);


            tr = document.createElement('tr');
            let td = document.createElement('td');
            td.innerHTML = `<em> bk = ${bk[i]}, bp = ${bp[i]}, bmc = ${bmc[i]}, <br>
            c1 = ${c1[i]}, c2 = ${c2[i]}, <br>
            tx_tau = ${tx_tau[i]}, <br>
            теплоемкость cp_mc = ${cp_mc[i]} , <br>
            теплопроводность lambda_mc = ${lambda_mc[i]} </em>`

            tr.appendChild(td);

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

    calculateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateValues();
        readTemperature()
        createMasCharacteristic(tempVal);
        printMas();
        // printGraf();
    })

    document.addEventListener('click', (e) => {
        // console.log(e)
    })


});
