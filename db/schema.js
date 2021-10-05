const { gql } = require("apollo-server");

// Schema
// Requiere en el schema un type query con una funcion
// y un resolver que satisfaga esa funcion
// Define lo que esta aqui es codigo de gql
const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    creado: String
  }

  type Token {
    token: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: ID
    vendedor: ID
    fecha: String
    estado: EstadoPedido
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }

  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }

  input PedidoProductoInput {
    id: ID
    cantidad: Int
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
  }

  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  type Query {
    # Usuarios
    obtenerUsuario(token: String!): Usuario

    # Productos
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    # Clientes
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente

    # Pedidos
    obtenerPedidos: [Pedido]
    obtenerPedidosVendedor: [Pedido]
    obtenerPedido(id: ID!): Pedido
    obtenerPedidosEstado(estado: String!): [Pedido]

    # Busquedas avanzadas
    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedor]
    buscarProducto(texto: String!): [Producto]
  }

  type Mutation {
    # Usuarios
    nuevoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token

    # Productos
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # Cliente
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String

    # Pedido
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): String
  }
`;

module.exports = typeDefs;
