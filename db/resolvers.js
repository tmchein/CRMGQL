const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");
const jwt = require("jsonwebtoken");

const crearToken = (usuario, secreto, expiracion) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreto, {
    expiresIn: expiracion,
  });
};

// Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, ctx) => {
      return ctx.usuario;
    },

    obtenerProductos: async () => {
      try {
        const productos = await Producto.find();
        return productos;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerProducto: async (_, { id }) => {
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      return producto;
    },

    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find();
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerCliente: async (_, { id }, ctx) => {
      // Revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Quien lo creo puede verlo

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }

      return cliente;
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find();
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.find({
          vendedor: ctx.usuario.id,
        }).populate("cliente");
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, ctx) => {
      //Verificar si el pedido existe
      const pedido = await Pedido.findById(id);

      if (!pedido) {
        throw new Error("El pedido no existe");
      }
      //Solamente quien lo creo puede verlo
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      //Retornar el result ado
      return pedido;
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

      return pedidos;
    },
    mejoresClientes: async () => {
      // Agregate toma diferentes valores
      // Sirve para hacer muchas operaciones
      const clientes = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$cliente",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clientes",
            localField: "_id",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return clientes;
    },

    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$vendedor",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "usuarios",
            localField: "_id",
            foreignField: "_id",
            as: "vendedor",
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return vendedores;
    },
    buscarProducto: async (_, { texto }, ctx) => {
      const productos = await Producto.find({
        $text: { $search: texto },
      }).limit(10);
      return productos;
    },
  },

  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;
      //Revisar el si el usuario ya esta registrado
      const existeUsuario = await Usuario.findOne({ email });

      if (existeUsuario) {
        throw new Error("El usuario ya esta registrado");
      }
      //Hashear su password
      input.password = await bcrypt.hash(password, 10);

      //Guardar en la db
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },

    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      //Si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      const passwordCorrecto = await bcrypt.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("Usuario y/o password incorrecto");
      }

      //crear token
      return {
        token: crearToken(existeUsuario, process.env.JWT_SECRET, "24h"),
      };
    },

    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);
        // almacenar en la bd
        const resultado = await producto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },

    eliminarProducto: async (_, { id }) => {
      const producto = await Producto.findById(id);

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      await Producto.findOneAndDelete({ _id: id });

      return "Producto eliminado";
    },

    nuevoCliente: async (_, { input }, ctx) => {
      console.log(ctx);
      const { email } = input;
      // verificar si ya esta registrado
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error("Cliente ya registrado");
      }
      const nuevoCliente = new Cliente(input);

      //Asignar al vendedor
      nuevoCliente.vendedor = ctx.usuario.id;

      //Guardarlo en la base de datos
      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarCliente: async (_, { id, input }, ctx) => {
      // Verificar si existe o no
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Verificar si el vendedor es quien edita

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }

      // Guardar el cliente

      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return cliente;
    },

    eliminarCliente: async (_, { id }, ctx) => {
      // Buscar si el cliente existe
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }
      // Buscar si el vendedor es quien elimina
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      // Eliminar el cliente
      await Cliente.findOneAndDelete({ _id: id });
      return "Cliente eliminado";
    },

    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      //Verificar si existe cliente o no
      let clienteExiste = await Cliente.findById(cliente);

      if (!clienteExiste) {
        throw new Error("Cliente no encontrado");
      }
      //Verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      //Revisar que el stock este disponible

      for await (const articulo of input.pedido) {
        const { id } = articulo;

        const producto = await Producto.findById(id);

        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo: ${producto.nombre} excede la cantidad disponible`
          );
        } else {
          producto.existencia = producto.existencia - articulo.cantidad;

          await producto.save();
        }
      }

      //Crear un nuevo pedido
      const nuevoPedido = new Pedido(input);

      //Asignarle un vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      //Guardarlo en la base de datos
      const resultado = await nuevoPedido.save();
      return resultado;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;

      //Verificar si el pedido existe
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("El pedido no existe");
      }

      //Verificar si existe cliente
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("El cliente no existe");
      }

      //Verificar que el pedido es de quien lo edita
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }

      //Revisar el stock
      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;

          const producto = await Producto.findById(id);

          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo: ${producto.nombre} excede la cantidad disponible`
            );
          } else {
            producto.existencia = producto.existencia - articulo.cantidad;

            await producto.save();
          }
        }
      }

      //Actualizar el pedido
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      //Retornar el pedido actualizado
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      //verificar si el pedido existe
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error("El pedido no existe");
      }
      //verificar si el vendedor es quien borra
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      //Eliminar pedido de la base de datos
      await Pedido.findOneAndDelete({ _id: id });
      return "Pedido Eliminado";
    },
  },
};

module.exports = resolvers;
