package cms.app.Repository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.User;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

}
