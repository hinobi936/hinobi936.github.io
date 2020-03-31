document.addEventListener('DOMContentLoaded', () => {
    const materialWidth = document.getElementById('material-width');
    const lambda = document.getElementById('lambda');
    const cp = document.getElementById('cp');
    const ro = document.getElementById('ro');
    const time = document.getElementById('time');
    const edgeLeft = document.getElementById('Edge-left');
    const edgeRight = document.getElementById('Edge-right');
    const quantity = document.getElementById('quantity');
    const calculateBtn = document.getElementById('calculate');
    const inputs = document.querySelectorAll('input');

    // массивы данных
    let T = [];
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
            inputs[i].style.border = ""
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
        // вытаскиваем значения полей
        let lambdaVal = Number(lambda.value), cpVal = Number(cp.value), roVal = Number(ro.value),
            timeVal = Number(time.value), edgeLeftVal = Number(edgeLeft.value), edgeRightVal = Number(edgeRight.value),
            N = Number(quantity.value), materialWidthVal = Number(materialWidth.value);

        let T0 = 20;
        alfa[0] = 0;
        beta[0] = edgeRightVal;

        // определяем шаги по времени и пространству
        const h = materialWidthVal / N;
        const tau = timeVal / N;
        // T = new Array(N);
        for (let i = 0; i < N + 1; i++) {
            T[i] = [0];
            for (let j = 0; j < N + 1; j++) {
                T[i][j] = T0;
            }
            console.log(T);
        }
        // T = new Array(N).fill(new Array(N).fill(T0));


        for (let i = 1; i < N + 1; i++) {
            // T[j]=[]
            for (let j = 0; j < N + 1; j++) {
                // T[j][i]=;
                A[j] = lambdaVal / (h * h);
                console.log(A[j]);
                B[j] = roVal * cpVal / tau + A[j];
                console.log(B[j]);
                C[j] = lambdaVal / (h * h);
                console.log(C[j]);
                F[j] = -((roVal * cpVal) / tau) * T[j][i - 1];
                console.log(F[j]);
            }
            for (let j = 1; j <= N+1; j++) {
                alfa[j] = A[j] / (B[j] - C[j] * alfa[j - 1]);
                console.log(alfa[j]);
                beta[j] = (C[j] * beta[j - 1] - F[j]) / (B[j] - C[j] * alfa[j - 1]);
                console.log(beta[j]);
            }

            T[(N + 1)][i] = edgeRightVal;

            for (let j = 1; j <= N; j++) {
                T[N + 1 - j][i] = alfa[N + 1 - j][i] * T[N + 2 - j][i] + beta[N + 1 - j][i];

                console.log(T[j][i], T[N + 1 - j][i], alfa[N + 1 - j][i], T[N + 2 - j][i], beta[N + 1 - j][i]);
            }

            // T[j][i] = edgeRightVal;

        }
        // T[N][N];





    })

    checkEmpty();



});
