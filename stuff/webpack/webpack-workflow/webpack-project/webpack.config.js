const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    /* app.js es el archivo principal */
    entry: './src/app.js',
    output: {
        /*debe ser una ruta absoluta*/
        /*dirname es una variable que indica el directorio en el que reside el script que se está ejecutando */
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    devServer:{
        port: 8000
    },   
    /* esta zona es un objeto */
    module: {
        /* cada objeto de rules es una configuración para decirle
        a webpack que archivos puede procesar*/
        rules: [
            {
                /*puede procesar todos los archivos que termine en .css*/
                //test: /\.css$/,
                test: /\.sass$/,
                /*esta propiedad la añadimos para que webpack
                entienda los archivos css*/
                use: [
                    { loader: MiniCssExtractPlugin.loader},
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    /* en el plugin le digo que me enlace el entry con lo que le meta en los plugin */
    plugins: [
        new HtmlWebpackPlugin({
            /* aqui se permite una ruta relativa */
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'bundle.css'
        }) 
    ]
}