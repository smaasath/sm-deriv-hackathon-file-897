import { AGENT_APIS } from '@constant';
import { AgentController } from '@controllers';
import { Router } from 'express';

export class AgentRoutes {
  private agentController: AgentController;

  private router: Router;

  constructor(router: Router) {
    this.router = router;
    this.agentController = new AgentController();
    this.configureRoutes();
  }

  private configureRoutes() {
    // GET / agent / test
    this.router.get(`${AGENT_APIS.AGENT_URL}/test`, this.agentController.test);
  }
}
