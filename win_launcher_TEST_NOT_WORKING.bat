@echo off
attention, ce script ne doit pas être éxécuté !!!

echo "vous devez avoir une version pas trop obsolete de NodeJS installee sur votre ordinateur. Sinon... ben ca ne marchera pas. Enfin, dans tous les cas, ça ne marchera pas car cette application n'est pas motorisee. Mais toujours est-il que sans NodeJS, ca ne fonctionnera pas.";
echo "bon, je verifie si node est sur cette machine..."
where node.exe >nul 2>&1 && echo installed && set nodeInstalled=true || echo not installed && set nodeInstalled=false;
if %nodeInstalled% == true (
    echo "NodeJs est installé. C'est bien!";
    echo "demarrage du serveur...";
    node server.js;
    echo "ouverture de l'application...";
) else (
    echo "node n'est pas installé";
)
