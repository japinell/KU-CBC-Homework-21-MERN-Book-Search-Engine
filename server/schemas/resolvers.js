const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log("Inside of me");
      console.log(context.user);
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError(
        "You need to log in to perform this query!"
      );
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Invalid email address");
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Invalid password");
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      console.log("saveBook :> ");
      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
        return user;
      }
      throw new AuthenticationError(
        "You need to log in to perform this action!"
      );
    },

    removeBook: async (parent, { bookId }, context) => {
      console.log("Inside of removeBook");
      if (context.user) {
        console.log("I am here");

        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        console.log(user);
        return user;
      }
      throw new AuthenticationError(
        "You need to log in to perform this action!"
      );
    },
  },
};

module.exports = resolvers;
