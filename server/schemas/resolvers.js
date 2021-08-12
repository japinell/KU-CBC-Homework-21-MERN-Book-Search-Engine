const { User, Book } = require("../models");

const resolvers = {
  Query: {
    users: async () => {
      return User.find({});
    },
    user: async (parent, { _id }) => {
      const params = _id ? { _id } : {};
      return User.find(params);
    },
    getSingleUser: async (parent, { user = null, params }) => {
      const foundUser = await User.find({
        $or: [
          { _id: user ? user._id : params.id },
          { username: params.username },
        ],
      });
      return foundUser;
    },
    login: async (parent, { user }) => {
      const foundUser = await User.find({
        $or: [{ username: user.username }, { email: user.email }],
      });

      const correctPw = await foundUser.isCorrectPassword(user.password);
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const createdUser = await User.create(args);
      return createdUser;
    },
    saveBook: async (parent, { user, book }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },
    deleteBook: async (parent, { user, book }) => {
      const deletedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: book.id } } },
        { new: true }
      );
      return deletedUser;
    },
  },
};

module.exports = resolvers;
