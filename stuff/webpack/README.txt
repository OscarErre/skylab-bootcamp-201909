Desde la versión 4.0.0, webpack no requiere de archivo de 
configuracion para agrupar nuestro proyecto, Sin embargo, lo 
puedes configurar según tus necesidades. 

->Conceptos del núcleo:

    1.Entry

El punto de entrada indica que modulo de webpack debe ser usado
para comenzar la construcción del grafo de dependencia interna.
Webpack descubrira de que otros módulos y bibliotecas depende
ese punto de entrada(directa o indirectamente).

                module.exports = {
                entry: './path/to/my/entry/file.js'
                };
    
    2.Output

Esta propiedad le dice a webpack donde emíte el paquete que 
crea y como nombra sus archivos. Por defecto será ./dist/main.js
para el archivo principal de salido y ./dist para cualquier otro
archivo.

                const path = require('path');

                module.exports = {
                entry: './path/to/my/entry/file.js',
                output: {
                    path: path.resolve(__dirname, 'dist'),
                    filename: 'my-first-webpack.bundle.js'
                }};

    3.Loaders

Webpack solo entiende arhivos JS y JSON. Los Loaders permiten a 
webpack procesar otro tipo de arhivos y convertirlos  en módulos 
validos que puedan ser consumidos por la aplicación y añadidos
al grafo de dependencias. Los loaders tienen dos propiedades en 
la configuración de webpack: test y use. La propiedad test 
identifica que archivo o archivos deben ser transformados. 
La propiedad use indica que tipo de loader debe ser usado para
la transformación de los archivos

                const path = require('path');

                module.exports = {
                output: {
                    filename: 'my-first-webpack.bundle.js'
                },
                module: {
                    rules: [
                    { test: /\.txt$/, use: 'raw-loader' }
                    ]
                }
                };

    4.Plugins

Los Plugins pueden ser aprovechados para realizar una gama más 
amplia de tareas como la optimización de paquetes, la gestión de
activos y la inyección de variables de entorno. Para usar un 
plugin usamos require(), la mayoría de los complementos se
pueden personalizar a través de opciones. Como puede usar un
complemento varias veces en una configuración para diferentes
propósitos, debe crear una instancia de él llamándolo con el
operador new. 


    const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};


        5.Mode

El párametro mode puede ser establicido como development, production o none. El valor por defecto es production


Nota: Webpack es compatible con todos los navegaros que cumplen
la ES5. Necesita Promise para import() y require.ensure(). Si 
desea admitir navegadores antiguos, deberá cargar un polyfyll antes de usar estas expresiones.
