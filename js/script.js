document.addEventListener('DOMContentLoaded', () => {
    const materialWidth = document.getElementById('material-width');
    const lambda = document.getElementById('lambda');
    const cp = document.getElementById('cp');
    const ro = document.getElementById('ro');
    const time = document.getElementById('time');
    const edgeLeft = document.getElementById('Edge-left');
    const edgeRight = document.getElementById('Edge-right');
    const firstTime = document.getElementById('firstTime');

    const devideWidth = document.getElementById('devideWidth');
    const devideTime = document.getElementById('devideTime');

    const calculateBtn = document.getElementById('calculate');
    const inputs = document.querySelectorAll('input');
    const dataOut = document.getElementById('dataOut');

    let width_layer, time_layer, calculateData;
    calculateData = document.createElement('p');

    // двумерный массив данных температур
    let T = [];
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

    function enableCalculation() {
        calculateBtn.disabled = false;
    }
    function changeBorderInput() {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value == "") {
                inputs[i].style.border = "1px solid red";
            }
            else {
                inputs[i].style.border = "";
            }
        }
    }

    calculateBtn.addEventListener('click', () => {
        event.preventDefault();
        dataOut.innerHTML = '';

        // вытаскиваем значения полей
        let lambdaVal = Number(lambda.value), cpVal = Number(cp.value), roVal = Number(ro.value),
            timeVal = Number(time.value), edgeLeftVal = Number(edgeLeft.value), edgeRightVal = Number(edgeRight.value),
            N = Number(devideWidth.value), K = Number(devideTime.value),
            materialWidthVal = Number(materialWidth.value), firstTimeVal = Number(firstTime.value);

        let T0 = firstTimeVal; //двумерный массив
        // одномерные массивы alfa beta
        alfa[0] = 0;
        beta[0] = edgeRightVal;

        // определяем шаги по времени и пространству
        const h = materialWidthVal / N;
        const tau = timeVal / N;

        // заполняем массив температур
        for (let i = 0; i <= N + 1; i++) {
            T[i] = [0];
            for (let j = 0; j <= K + 1; j++) {
                T[i][j] = T0;
            }
        }

        for (let i = 0; i <= K + 1; i++) {
            // определяем коэффициенты
            // console.log("===================  i = ", i, " =================== ");
            for (let j = 0; j <= N + 1; j++) {
                // console.log("____ j = ", j, " ____");
                // console.log("____ A, B, С, F ____");
                A[j] = lambdaVal / (h * h);
                // console.log(A[j]);
                B[j] = roVal * cpVal / tau + A[j];
                // console.log(B[j]);
                C[j] = lambdaVal / (h * h);
                // console.log(C[j]);
                F[j] = -((roVal * cpVal) / tau) * T[j][i];
                // console.log(T[j][i - 1]);
            }

            for (let j = 1; j <= N + 1; j++) {
                // console.log("____ j = ", j, " ____");
                // console.log("____ alfa, beta ____")
                alfa[j] = A[j] / (B[j] - C[j] * alfa[j - 1]);
                // console.log(alfa[j]);
                beta[j] = (C[j] * beta[j - 1] - F[j]) / (B[j] - C[j] * alfa[j - 1]);
                // console.log(beta[j]);
            }

            // устанавливаем граничное условие для внешнего слоя металла
            T[(N + 1)][i] = edgeLeftVal;
            // width_layer = 0;

            // определям температуру в каждом узле [j][i]
            for (let j = 0; j <= N; j++) {
                T[N - j][i] = alfa[N - j] * T[N + 1 - j][i] + beta[N - j];
                // console.log("____ j = ", j, " ____");
                // console.log("____ T[N + 1 - j][i] = " ,T[N + 1 - j][i] ," ____");
                // console.log("____ alfa [N + 1 - j] = " ,alfa[N + 1 - j] ," ____");
                // console.log("____  T[N + 2 - j][i] = " , T[N + 2 - j][i] ," ____");
                // console.log("____  beta[N + 1 - j] = " , beta[N + 1 - j]," ____");
                // width_layer += T[N - j][i] + "__";
                // console.log(T[j][i], T[N + 1 - j][i], alfa[N + 1 - j][i], T[N + 2 - j][i], beta[N + 1 - j][i]);
            }
        }

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
                th.innerHTML = ` СЛОЙ ${j} `;
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
        console.log(T);

        // создаем массив для canvas
        let Txy = [];
        for (let i = 0; i <= K+1; i++) {
            Txy[i]=0;            
        }

        // определяем координаты для построения
        for (let i = 0; i <= K + 1; i++) {
            for (let j = 1; j <= N + 1; j++) {
                if (T[j][i] > T[j-1][i]) {
                    Txy[i] = T[j][i];
                }
            }
        }
        console.log("  Txy[i] = ", Txy);


    })

    checkEmpty();



});
