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
    this.router.get(`${AGENT_APIS.AGENT_URL}test`, this.agentController.test);

    this.router.get(`${AGENT_APIS.AGENT_URL}addTestData`, this.agentController.addTestData);

    this.router.get(`${AGENT_APIS.AGENT_URL}getDashboard`, this.agentController.getDashboard);

    this.router.get(`${AGENT_APIS.AGENT_URL}getBeliefs`, this.agentController.getBeliefs);

    this.router.get(
      `${AGENT_APIS.AGENT_URL}getInvestigationLogs`,
      this.agentController.getInvestigationLogs,
    );

    this.router.get(
      `${AGENT_APIS.AGENT_URL}getExecutiveReport`,
      this.agentController.getExecutiveReport,
    );
    this.router.get(
      `${AGENT_APIS.AGENT_URL}getAllExecutiveReport`,
      this.agentController.getAllExecutiveReport,
    );
  }
}
