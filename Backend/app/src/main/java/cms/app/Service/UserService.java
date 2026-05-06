package cms.app.Service;
import java.util.List;

import org.springframework.stereotype.Service;

import cms.app.Entity.User;
import cms.app.Repository.UserRepository;

@Service
public class UserService{

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}
