package cms.app;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import cms.app.Service.SmsService;

@SpringBootTest
class AppApplicationTests {

	@MockBean
	private SmsService smsService;

	@Test
	void contextLoads() {
	}

}
